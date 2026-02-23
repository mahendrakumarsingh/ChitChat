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
            fs.appendFileSync('server_debug.txt', `[${new Date().toISOString()}] Call initiated by ${callerId} to ${receiverId}, video: ${isVideo}\n`);

            console.log(`Call initiated by ${callerId} to ${receiverId}, video: ${isVideo}`);

            const receiverSockets = getUserSockets(receiverId);
            const availableUsers = Array.from(userSockets.keys());
            fs.appendFileSync('server_debug.txt', `[${new Date().toISOString()}] Available users: [${availableUsers.join(', ')}]\n`);
            fs.appendFileSync('server_debug.txt', `[${new Date().toISOString()}] Receiver ${receiverId} has ${receiverSockets.size} sockets\n`);

            if (receiverSockets.size === 0) {
                // Emitting an automatic rejection if the user is literally offline
                emitToUser(callerId, 'call:rejected', { receiverId, reason: 'offline' });
                return;
            }

            emitToUser(receiverId, 'call:incoming', {
                callerId,
                callerName,
                receiverId,
                isVideo
            });
        });

        socket.on('call:accept', ({ callerId, receiverId }) => {
            const fs = require('fs');
            fs.appendFileSync('server_debug.txt', `[${new Date().toISOString()}] Call accepted by ${receiverId} for ${callerId}\n`);
            emitToUser(callerId, 'call:accepted', { receiverId });
        });

        socket.on('call:reject', ({ callerId, receiverId }) => {
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
    fs.appendFileSync('server_debug.txt', `[${new Date().toISOString()}] Emitting ${event} to user ${userId} (Sockets: ${sockets.size}). Available user keys: [${availableUsers}]\n`);

    console.log(`[Socket] Emitting ${event} to user ${userId} (Sockets: ${sockets.size})`);
    sockets.forEach(socketId => {
        io.to(socketId).emit(event, data);
    });
};

module.exports = {
    init,
    getIO,
    getUserSockets,
    emitToUser
};
