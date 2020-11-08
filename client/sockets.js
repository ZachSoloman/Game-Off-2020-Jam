
var socket = io('/moonshot');
var user = "";
var room;

function socket_GetUser() {
  return user;
}

// general idea behind client api:
//   sends:
//    -> username
//    -> chat messages
//    -> input data
//    -> rematch request
//   receives:
//    -> hi
//    -> userExists
//    -> setUser
//    -> state of room (all users positions and velocities (for client interpolation))
//    -> chat messages
//    -> rematch request
/* load existing users supplied from the server */

/* set username to input value */
function socket_SendUsername() {
  socket.emit('setUsername', document.getElementById('name').value);
}

/* send a message in the chat interface */
function socket_SendMessage() {
  var msg = document.getElementById('message').value;
  if (msg) {
    socket.emit('msg', { message: msg, user: user });
  }
}

function socket_SendKey(k) {
  socket.emit('key', k);
}

function socket_SendRematchRequest(data) {
  socket.emit('doRematch' );
}

/* handshake */
socket.on('hi',function(data) {
  if(document.getElementById('error-container'))
    document.getElementById('error-container').innerHTML = data.message;
  //loadUsers(data.users);
});

socket.on('userExists', function(data) {
  document.getElementById('error-container').innerHTML = data;
});

socket.on('userSet', function(data) {
  user = data.username;
  room = data.room;
  
  let initial_msg = "Welcome to " + data.room;
  document.getElementById('login').innerHTML = 
   '<div> \
	   <input type = "text" id = "message"> \
	   <button type = "button" name = "sendbutton" onclick = "socket_SendMessage()">Send</button> \
    </div>\
    <div id = "message-container">'+initial_msg+'</div>'
  ;
});

socket.on('matchEnd', function() {
  document.getElementById('message-container').innerHTML += '<div id = "rematch" > \
     <button type = "button" name = "rematchButton" onclick = "socket_Rematch()">Rematch?</button> \
    </div>'
  ;
});

socket.on('removeChatDiv', function(id) {
  let removeMe = document.getElementById(id);
  if(removeMe)
    removeMe.parentNode.removeChild(removeMe);
});

socket.on('newmsg', function(data) {
  if(user) {
    let length = document.getElementById('message-container').childNodes.length;
    if(length > 6) {
      document.getElementById('message-container').removeChild(document.getElementById('message-container').childNodes[1]); 
      console.log(length);
    }

    document.getElementById('message-container').innerHTML += '<div><b>' + 
    data.user + '</b>: ' + data.message + '</div>'

    document.getElementById('message').value = "";
  }
}); 

socket.on('gameData', function(data) {
  Spheres = data;
}); 
