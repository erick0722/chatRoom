var express = require('express');
var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var path = require("path");

var userNum = 0;
var usersList = [];
var chatLog = [];

app.use(express.static(path.join(__dirname, "public")));

io.on('connection', function(socket){
	var color = getRandomColor();
    console.log('a user connected');

	socket.emit('new');
	
    socket.on('new user', function() {
        userNum++;
        var nickname = "User" + userNum;
        socket.color = color;
        socket.name = nickname;
        usersList.push({nickname: nickname, color: color});
        socket.emit('chat history', chatLog);
        socket.emit('new user', nickname);
		socket.emit('new cookie', nickname, color)
        io.emit('new userlist', usersList);
    });
	
	socket.on('new cookie', function(nickname){
        userOnline = usersList.length;
		socket.name = nickname;
		socket.color = color;
        usersList.push({nickname: nickname, color: color});
        socket.emit('chat history', chatLog);
		io.emit('new userlist', usersList);
    });
    
    socket.on('disconnect', function(){

        for(var i = 0; i < usersList.length; i++){
            if(usersList[i].nickname === socket.name){
                usersList.splice(i, 1);
            }
        }
        io.emit('new userlist', usersList);
    });

    socket.on('chat message', function(msg){

        if(msg.startsWith("/nick ")) {
            var oldUsername = socket.name;
            socket.name = msg.slice(6);
            var taken = false;
            for (var i = 0; i < usersList.length; i++) {
                if(usersList[i].nickname === socket.name) {
                    taken = true;
                    socket.emit('nickname taken', socket.name);
                    socket.name = oldUsername;
                    break;
                }
            }
            if(!taken) {
                for (var i = 0; i < usersList.length; i++) {
                    if (usersList[i].nickname === oldUsername) {
                        usersList[i].nickname = socket.name;
                    } 
                }
                io.emit('new userlist', usersList);
                socket.emit('new cookie name', socket.name);
                socket.emit('new name', socket.name);
            }
        } else if (msg.startsWith("/nickcolor ")) {
            socket.color = msg.slice(11);
            var validColor = isHexColor(socket.color);
            if(validColor) {
                for(var i = 0; i < usersList.length; i++) {
                    if(usersList[i].nickname === socket.name) {
                        usersList[i].color = socket.color;
                    }
                }
                io.emit('new userlist', usersList);
            } else {
                socket.emit('invalid color', socket.color);
            }

        } else {
            var currTime = getTime();
            chatLog.push({user: socket.name, color: socket.color, msg: msg, timeStamp: currTime});
            socket.broadcast.emit('chat message', currTime, socket.color, socket.name, msg);
            socket.emit('bold chat message', currTime, socket.color, socket.name, msg);
        }
    });
});

function getTime() {
    var currTime;
    var date = new Date();
    var hour = date.getHours();
    var min = date.getMinutes();
  
    if(min < 10) {
      min = "0" + min;
    }
    currTime = hour + ":" + min;
  
    return currTime;
}

// https://stackoverflow.com/questions/1484506/random-color-generator
function getRandomColor() {
    var varters = '0123456789ABCDEF';
    var color = '';
    for (var i = 0; i < 6; i++) {
        color += varters[Math.floor(Math.random() * 16)];
    }
    return color;
}

http.listen(3000, function(){
    console.log('listening on *:3000');
});

// https://stackoverflow.com/questions/8027423/how-to-check-if-a-string-is-a-valid-hex-color-representation/8027444
function isHexColor (hex) {
    return typeof hex === 'string'
        && hex.length === 6
        && !isNaN(Number('0x' + hex))
  }