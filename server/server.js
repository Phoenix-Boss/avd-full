const http = require('http');
const socketIo = require('socket.io');
const app = require('./index');

const server = http.createServer(app);
const io = socketIo(server);

io.on('connection', (socket) => {
    console.log('New client connected');

    socket.on('message', (data) => {
        io.emit('message', data);
    });

    socket.on('disconnect', () => {
        console.log('Client disconnected');
    });
});

module.exports = server;