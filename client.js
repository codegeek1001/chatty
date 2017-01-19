
var socket = io();

    new Vue({
        el: '#app',
        data: {
            connectedUsers: [],
            messages: [],
            message: {
                "type": "",
                "action": "",
                "user": "",
                "text": "",
                "timestamp": ""
            },
            areTyping: []
        },
        created: function () {
            //if server emits 'user joined', update connectedUsers array
            socket.on('user joined', function (socketId) {

                // get already connected users first
                axios.get('/onlineusers')
                    .then(function (response) {
                        for(var key in response.data) {
                            if(this.connectedUsers.indexOf(key) <= -1) {
                                this.connectedUsers.push(key);
                            }
                        }
                        console.log(this.connectedUsers);
                    }.bind(this));
                var infoMsg = {
                    "type": "info",
                    "msg": "User " + socketId + " has joined"
                }
                this.messages.push(infoMsg);
            }.bind(this));

            // if server emits 'chat.message', update messages array
            socket.on('chat.message', function (message) {
                this.messages.push(message);
            }.bind(this));

            // server emits 'user typing'
            socket.on('user typing', function (username) {
                this.areTyping.push(username);
            }.bind(this));

           //server emits 'stopped typing'
           socket.on('stopped typing', function (username) {
               var index = this.areTyping.indexOf(username);
               if(index >= 0) {
                   this.areTyping.splice(index,1);
               }
           }.bind(this));

            //if server broadcasts 'user left', remove leaving user from connectedUsers array
            socket.on('user left', function (socketId) {
                var index = this.connectedUsers.indexOf(socketId);
                if(index >= 0) {
                    this.connectedUsers.splice(index,1);
                }
                var infoMsg = {
                    "type": "info",
                    "msg": "User " + socketId + " has left"
                }
                this.messages.push(infoMsg);
            }.bind(this));
        },
        methods: {
            send: function () {
                this.message.type = "chat";
                this.message.user = socket.id;
                this.message.timestamp = moment().calendar();
                socket.emit('chat.message', this.message);
                this.message.type = '';
                this.message.user = '';
                this.message.text = '';
                this.message.timestamp = '';

            },
            userIsTyping: function (username) {
                if(this.areTyping.indexOf(username) >= 0) {
                   return true; 
                }
                return false;
            },
            usersAreTyping: function () {
                if(this.areTyping.indexOf(socket.id) <= -1) {
                    this.areTyping.push(socket.id);
                    socket.emit('user typing', socket.id);
                }
            },
            stoppedTyping: function (keycode) {
                if(keycode == '13' || (keycode == '8' && this.message.text == '')) {
                    var index = this.areTyping.indexOf(socket.id);
                    if (index >= 0) {
                        this.areTyping.splice(index,1);
                        socket.emit('stopped typing', socket.id);
                    }
                }
            }
        }
    });
