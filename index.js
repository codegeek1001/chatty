var express = require('express');
var app = express();
var server = require('http').Server(app);
var port = process.env.PORT || 3000;

var io = require('socket.io')(server);

server.listen(port, function () {
    console.log("Listening on *:" + port);
});

app.use(express.static(__dirname));

app.get('/', function(request,response) {
    response.sendFile(__dirname + '/index.html');
});

app.get('/onlineusers', function(request,response) {
    //console.log(io.sockets.adapter.rooms);
    response.send(io.sockets.adapter.rooms);
});

io.on('connection', function (socket) {
    console.log('A user connected:' + socket.id);

    //Tell all clients that someone connected
    io.emit('user joined', socket.id)

    // The client sends 'chat.message' event to server
    socket.on('chat.message', function (message) {
        //Emit this event to all clients connected to it
        io.emit('chat.message', message);
    });

    //client sends "user typing" event to server
    socket.on('user typing', function (username) {
        io.emit('user typing', username);
    });

    //client sends 'stopped typing' event to server
    socket.on('stopped typing', function (username) {
        io.emit('stopped typing', username);
    });


    socket.on('disconnect', function () {
        console.log('User left: ' + socket.id);

        //Tell all clients that someone disconnected
        socket.broadcast.emit('user left', socket.id);
    });
});
