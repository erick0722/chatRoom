var socket;
var username;
var chatLog = $('#chatMessages');

$(document).ready(onLoad());

function onLoad() {
    socket = io();

    $('form').submit(function () {
        socket.emit('chat message', $('#userMsg').val());
        $('#userMsg').val('');
        return false;
    });
	
	socket.on('new', function(){
		if(document.cookie){
			socket.emit('new cookie', document.cookie);
			$('#userName').text("You are " + document.cookie);
			$('#userList').append($('<li>').text(document.cookie));
		}else{
			socket.emit('new user');
		}
	});
	
	socket.on('new cookie', function(username){
		document.cookie = username;
		$('#userName').text("You are " + username);
		$('#userList').append($('<li>').text(username));
    });
    
    socket.on('new name', function(username){
        $('#userName').text("You are " + username);
    });
	
	socket.on('new cookie name', function(newName){
		if(document.cookie){
			document.cookie = newName;
		}
	});

    socket.on('new userlist', function (usersList) {
        $('#userList').text("");
        for (var i = 0; i < usersList.length; i++) {
            $('#userList').append($('<li>').html('<span style="color:#' + usersList[i].color + '">'
            + usersList[i].nickname + '</span>'));
        }
    });

    socket.on('chat history', function(chatLog) {
        for (var i = 0; i < chatLog.length; i++) {
            $('#chatMessages').append($('<li>').html(chatLog[i].timeStamp + " " + '<span style="color:#' + chatLog[i].color + '">'
            + chatLog[i].user + ': </span>' + chatLog[i].msg));
        }

        $('.chatBox').animate({scrollTop: $('.chatBox').prop("scrollHeight")}, 500);
     });

    socket.on('chat message', function (currTime, color, username, msg) {

        $('#chatMessages').append($('<li>').html(currTime + " " + '<span style="color:' + color + '">'
            + username + ': </span>' + msg));

        $('.chatBox').animate({scrollTop: $('.chatBox').prop("scrollHeight")}, 500);

    });

    socket.on('bold chat message', function (currTime, color, username, msg) {
        
        $('#chatMessages').append($('<li>').html(currTime + " " + '<b><span style="color:#' + color +
            '">' + username + ': </span>' + msg + '</b>'));
        
        $('.chatBox').animate({scrollTop: $('.chatBox').prop("scrollHeight")}, 500);

    });

    socket.on('nickname taken', function(nick) {
    
        $('#chatMessages').append($('<li>').html('<span style="color:red">' + nick + " is already taken" + '</span>'));
   
    });

    socket.on('invalid color', function(color) {
    
        $('#chatMessages').append($('<li>').html('<span style="color:red">' + color + " is an invalid color, try a different one" + '</span>'));
   
    });
}