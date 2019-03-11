var express = require('express');
var app = express();
var http = require('http').createServer(app);
var io = require('socket.io')(http);
var port = process.env.PORT || 2500;
var activeUsers = {};  
var chatcolor = {};
var historyChat = [];


http.listen( port, function () {
    console.log('listening on port', port); 
});

app.use(express.static(__dirname + '/public'));


io.on("connection", function (socket) {
    
    
    function randString() {
        var text = "";
        var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
      
        for (var i = 0; i < 5; i++)
          text += possible.charAt(Math.floor(Math.random() * possible.length));
      
        return text;
      }
      
      console.log(randString());
    
     
    
    socket.on("join", function(nickname){
    	if (nickname == "") {
    		nickname = randString() + (Object.keys(activeUsers).length + 1 )
    	}

        activeUsers[socket.id] = nickname;
        chatcolor[socket.id] = '228B22';
        io.sockets.emit("setNickname", '', nickname);
        io.sockets.emit("setUsers", activeUsers);
    	io.sockets.emit("chatHistory", historyChat, nickname);
    });







    socket.on("changeNickname", function(nickname){
        var unique = true;
        for (var key in activeUsers) {
            if (activeUsers[key] == nickname) {
                unique = false;
            }
        }
        if (unique) {
            oldNickname = activeUsers[socket.id];
            for (var key in activeUsers) {
                if (activeUsers[key] == oldNickname) {
                    activeUsers[key] = nickname
                }
            }

            io.sockets.emit("setNickname", oldNickname, nickname);
            io.sockets.emit("setUsers", activeUsers);
        }
    });

    socket.on("colorSwitch", function(color){
    	chatcolor[socket.id] = color;
    });

    socket.on("chatUpdate", function(socketId, message){
    	if (socketId == socket.id) {
    		historyChat.push(message);
    	}
    });

    socket.on("send", function(msg){
        var date = new Date;
        var hrs = date.getHours();
        var mins = date.getMinutes();
        var seconds = date.getSeconds();
		var timestamp = hrs + ':' + mins + ':' + seconds;

        io.sockets.emit("chat", socket.id, timestamp, activeUsers[socket.id], chatcolor[socket.id], msg);
    });

 

    socket.on("disconnect", function(){
        delete activeUsers[socket.id];
        io.sockets.emit("setUsers", activeUsers);

        if (Object.keys(activeUsers).length === 0) {
        	historyChat = [];
        }
    });


});