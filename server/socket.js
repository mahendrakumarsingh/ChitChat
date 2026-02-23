const socketIo = require('socket.io');

let io;
const userSockets = new Map(); // Map userId -> Set of socketIds

const init = (server) => {
    io = socketIo(server, {
        cors: {
            origin: '*', // Allow all origins for development
            methods: ['GET', 'POST']
        }
    });

    io.engine.on("connection_error", (err) => {
        console.log("Connection error:", err.req?.url, err.code, err.message, err.context);
    });

    io.on('connection', (socket) => {
        console.log('Socket connected:', socket.id);

        socket.on('user:online', ({ userId }) => {
            if (!userId) return;
            const strId = String(userId);

            console.log(`User online: ${strId} (socket: ${socket.id})`);

            // Add socket to user's set
            if (!userSockets.has(strId)) {
                userSockets.set(strId, new Set());
            }
            userSockets.get(strId).add(socket.id);
            const fs = require('fs');
            fs.appendFileSync('server_debug.txt', `[${new Date().toISOString()}] Registered ${strId} to socket ${socket.id}. Total: ${userSockets.get(strId).size}\n`);
            console.log(`[Socket] Registered ${strId} to socket ${socket.id}. Total sockets for user: ${userSockets.get(strId).size}`);

            // Store userId on socket for disconnect handling
            socket.userId = strId;

            // Broadcast user online status to all clients including self
            io.emit('user:online', { userId: strId });

            // Send current online users list to the newly connected user
            const onlineUsersList = Array.from(userSockets.keys());
            socket.emit('users:online', onlineUsersList);
        });

        // Typing events
        socket.on('typing:start', ({ conversationId }) => {
            // Broadcast to everyone in the room (except sender) isn't straightforward without joining rooms
            // For now, we'll keep it simple or implement rooms if needed.
            // Ideally, clients should join rooms based on conversationId.
            socket.broadcast.emit('typing:start', {
                conversationId,
                userId: socket.userId
            });
        });

        socket.on('typing:stop', ({ conversationId }) => {
            socket.broadcast.emit('typing:stop', {
                conversationId,
                userId: socket.userId
            });
        });

        // WebRTC & Call events
        socket.on('call:initiate', ({ callerId, receiverId, callerName, isVideo }) => {
            const fs = require('fs');
            const timestamp = new Date().toISOString();
            const debugMsg = `[${timestamp}] ===== CALL:INITIATE ===== Caller: ${callerId}, Receiver: ${receiverId}, Video: ${isVideo}\n`;
            fs.appendFileSync('server_debug.txt', debugMsg);
            console.log(`===== CALL:INITIATE ===== Caller: ${callerId}, Receiver: ${receiverId}, Video: ${isVideo}`);

            const receiverSockets = getUserSockets(receiverId);
            const availableUsers = Array.from(userSockets.keys());
            fs.appendFileSync('server_debug.txt', `[${timestamp}] Available users: [${availableUsers.join(', ')}]\n`);
            fs.appendFileSync('server_debug.txt', `[${timestamp}] Receiver ${receiverId} has ${receiverSockets.size} socket(s)\n`);
            console.log(`Available users: [${availableUsers.join(', ')}]`);
            console.log(`Receiver ${receiverId} has ${receiverSockets.size} socket(s)`);

            if (receiverSockets.size === 0) {
                // Emitting an automatic rejection if the user is literally offline
                fs.appendFileSync('server_debug.txt', `[${timestamp}] Receiver is offline - sending rejection\n`);
                console.log('Receiver is offline - sending rejection');
                emitToUser(callerId, 'call:rejected', { receiverId, reason: 'offline' });
                return;
            }

            fs.appendFileSync('server_debug.txt', `[${timestamp}] Emitting call:incoming to receiver ${receiverId}\n`);
            console.log(`Emitting call:incoming to receiver ${receiverId}`);
            emitToUser(receiverId, 'call:incoming', {
                callerId,
                callerName,
                receiverId,
                isVideo
            });
        });

        socket.on('call:accept', ({ callerId, receiverId }) => {
            const fs = require('fs');
            const timestamp = new Date().toISOString();
            fs.appendFileSync('server_debug.txt', `[${timestamp}] ===== CALL:ACCEPT ===== Receiver: ${receiverId}, Caller: ${callerId}\n`);
            console.log(`===== CALL:ACCEPT ===== Receiver: ${receiverId}, Caller: ${callerId}`);
            emitToUser(callerId, 'call:accepted', { receiverId });
        });

        socket.on('call:reject', ({ callerId, receiverId }) => {
            const fs = require('fs');
            const timestamp = new Date().toISOString();
            fs.appendFileSync('server_debug.txt', `[${timestamp}] ===== CALL:REJECT ===== Receiver: ${receiverId}, Caller: ${callerId}\n`);
            console.log(`===== CALL:REJECT ===== Receiver: ${receiverId}, Caller: ${callerId}`);
            emitToUser(callerId, 'call:rejected', { receiverId });
        });

        socket.on('call:end', ({ otherUserId }) => {
            emitToUser(otherUserId, 'call:ended', { userId: socket.userId });
        });

        socket.on('webrtc:offer', ({ offer, receiverId, callerId }) => {
            emitToUser(receiverId, 'webrtc:offer', { offer, callerId });
        });

        socket.on('webrtc:answer', ({ answer, callerId, receiverId }) => {
            emitToUser(receiverId, 'webrtc:answer', { answer, callerId });
        });

        socket.on('webrtc:ice-candidate', ({ candidate, receiverId, senderId }) => {
            emitToUser(receiverId, 'webrtc:ice-candidate', { candidate, senderId });
        });

        socket.on('disconnect', () => {
            console.log('Socket disconnected:', socket.id);

            if (socket.userId && userSockets.has(socket.userId)) {
                const sockets = userSockets.get(socket.userId);
                sockets.delete(socket.id);

                if (sockets.size === 0) {
                    userSockets.delete(socket.userId);
                    io.emit('user:offline', { userId: socket.userId });
                    console.log(`User offline: ${socket.userId}`);
                }
            }
        });
    });

    return io;
};

const getIO = () => {
    if (!io) {
        throw new Error('Socket.io not initialized!');
    }
    return io;
};

const getUserSockets = (userId) => {
    return userSockets.get(String(userId)) || new Set();
};

const emitToUser = (userId, event, data) => {
    const sockets = getUserSockets(userId);
    const fs = require('fs');
    const availableUsers = Array.from(userSockets.keys()).join(', ');
    const timestamp = new Date().toISOString();
    const debugMsg = `[${timestamp}] emitToUser: event=${event}, userId=${userId}, socketCount=${sockets.size}, availableKeys=[${availableUsers}]\n`;
    fs.appendFileSync('server_debug.txt', debugMsg);

    console.log(`[emitToUser] Emitting ${event} to user ${userId} (${sockets.size} socket(s)). Available users: [${availableUsers}]`);

    if (sockets.size === 0) {
        fs.appendFileSync('server_debug.txt', `[${timestamp}] WARNING: User ${userId} has no sockets!\n`);
        console.warn(`[emitToUser] WARNING: User ${userId} has no sockets!`);
    }

    sockets.forEach(socketId => {
        console.log(`[emitToUser] Sending ${event} to socket ${socketId}`);
        io.to(socketId).emit(event, data);
    });
};

module.exports = {
    init,
    getIO,
    getUserSockets,
    emitToUser
};
