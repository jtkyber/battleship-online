const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require('socket.io');
const io = new Server(server, {
    cors: {
        origin: 'http://localhost:3000',
        methods: ["GET", "POST"]
    }
});

io.on('connection', (socket) => {
    socket.on('send shot to opponent', data => {
        socket.broadcast.to(data.socketid).emit('receive shot', data.target);
    })

    socket.on('send result to opponent board', data => {
        socket.broadcast.to(data.socketid).emit('show result on opponent board', {result: data.shot, shotSquare: data.shotSquare});
    })

    socket.on('update user status', socketId => {
        socket.broadcast.to(socketId).emit('update friend status');
    })

    socket.on('send invite', data => {
        socket.broadcast.to(data.socketid).emit('receive invite', {username: data.username, socketid: data.currentSocket});
    })

    socket.on('send go to game', socketid => {
        socket.broadcast.to(socketid).emit('receive go to game');
    })

    socket.on('send friend request', socketid => {
        socket.broadcast.to(socketid).emit('receive friend request');
    })

    socket.on('send ready status', socketid => {
        socket.broadcast.to(socketid).emit('receive ready status');
    })

    socket.on('game over', socketid => {
        socket.broadcast.to(socketid).emit('receive game over');
    })
});


server.listen(3001, () => {
    console.log('listening on port 3001');
});
