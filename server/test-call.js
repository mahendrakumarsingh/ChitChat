const io = require('socket.io-client');

const callerId = '66db69b7f1a3e8e7c10b0001';
const receiverId = '66db69b7f1a3e8e7c10b0002';

const caller = io('http://localhost:4000', { reconnection: false });
const receiver = io('http://localhost:4000', { reconnection: false });

caller.on('connect', () => {
    console.log('Caller connected');
    caller.emit('user:online', { userId: callerId });
});

receiver.on('connect', () => {
    console.log('Receiver connected');
    receiver.emit('user:online', { userId: receiverId });

    // Initiate call after both are connected
    setTimeout(() => {
        console.log('Initiating call...');
        caller.emit('call:initiate', {
            callerId,
            receiverId,
            callerName: 'Test Caller',
            isVideo: true
        });
    }, 1000);
});

receiver.on('call:incoming', (data) => {
    console.log('SUCCESS! Receiver got call:incoming:', data);
    process.exit(0);
});

setTimeout(() => {
    console.log('TIMEOUT! Did not receive call:incoming on receiver.');
    process.exit(1);
}, 3000);
