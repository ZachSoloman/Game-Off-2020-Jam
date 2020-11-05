
var socket = io('/moonshot');
var user = "";
var room;
var user_colors = 
	[
		{name:"red", color:[255,0,0,255]},
		{name:"blue", color:[0,0,255,255]},
		{name:"green", color:[0,255,0,255]},
		{name:"purple", color:[255,128,0,255]},
		{name:"yellow", color:[255,255,0,255]}
	]

/* External */

function socket_GetUser() {
  return user;
}

/* Internal */

/* load existing users supplied from the server */
function loadUsers(users) {

  clearSpheres();
  for (let u = 0; u < users.length; u++) {
    createSphere(users[u], user_colors[u % user_colors.length].name, 
		 user_colors[u % user_colors.length].color);
  }
}

/* remove existed users from the server */
function removeUser( user ) {
  console.log( user );
  //removeUserSpheres( user.id );
}

/* set username to input value */
function setUsername() {
  socket.emit('setUsername', document.getElementById('name').value);
};

/* send a message in the chat interface */
function sendMessage() {
  var msg = document.getElementById('message').value;
  if (msg) {
    socket.emit('msg', {message: msg, user: user, room:room});
  }
}

/* save your sphere position to the server */
function saveSphereData(data) {
  socket.emit('saveData', { data:data });
}

/* retrieve a sphere position from the server by id */
function retrieveSphereData(id) {
  socket.emit('retrieveData', id );
}

function play() {
  document.getElementById('message-container').innerHTML = "";
  socket.emit('getRoom', {user: user});
}

/* handshake */
socket.on('hi',function(data) {
  if(document.getElementById('error-container'))
    document.getElementById('error-container').innerHTML = data.message;
  loadUsers(data.users);
});

socket.on('userExists', function(data) {
  document.getElementById('error-container').innerHTML = data;
});

socket.on('userSet', function(data) {
  user = data.username;
  // let color_index = (data.users.length - 1) % colorNames.length;
  // createSphere(user, user_colors[color_index].name, user_colors[color_index].color);
  loadUsers(data.users);
  document.getElementById('login').innerHTML = 
   '<div id = "message-container"></div> \
    <div> \
	<input type = "text" id = "message"> \
	<button type = "button" name = "sendbutton" onclick = "sendMessage()">Send</button> \
    </div> \
    <div>'
/*	<button style="width:'+100+'%; padding:'+4+'px;" type = "button" name = "playbutton" onclick = "play()">Play</button> \
    </div> */
  ;
});

socket.on('newmsg', function(data) {
  if(user) {
    document.getElementById('message-container').innerHTML += '<div><b>' + 
    data.user + '</b>: ' + data.message + '</div>'
  }
});

socket.on('setRoom', function(data) {
  if(user ) {
    room = data.room;
  }
});     

socket.on('spawnAll', function(data) {
  Spheres = [];
  loadUsers(data.users);
}); 

socket.on('loadData', function(data) {
  //console.log(data);
  if(data.data.id < Spheres.length 
  && data.data.name != user 
  && data != undefined) {
    Spheres[data.data.id].readData(data.data);
  }
});

socket.on('userDisconnect', function(username) {
  if (Spheres.length > 0)
    for (let i = Spheres.length - 1; i >= 0 ; --i)
      if (Spheres[i].name == username && username != user)
        Spheres.splice(i, 1);
});
