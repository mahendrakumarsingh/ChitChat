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

            console.log(`User online: ${userId} (socket: ${socket.id})`);

            // Add socket to user's set
            if (!userSockets.has(userId)) {
                userSockets.set(userId, new Set());
            }
            userSockets.get(userId).add(socket.id);
            console.log(`[Socket] Registered ${userId} to socket ${socket.id}. Total sockets for user: ${userSockets.get(userId).size}`);

            // Store userId on socket for disconnect handling

            // Store userId on socket for disconnect handling
            socket.userId = userId;

            // Broadcast user online status
            socket.broadcast.emit('user:online', { userId });
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
    return userSockets.get(userId) || new Set();
};

const emitToUser = (userId, event, data) => {
    const sockets = getUserSockets(userId);
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
