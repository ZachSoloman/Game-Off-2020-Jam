
var socket = io('/moonshot');
var user = "";
var room;
var colorNames = ["red","blue","green","purple","yellow"];
var colors = [[255,0,0,255],[0,0,255,255],[0,255,0,255],[255,128,0,255],[255,255,0,255]];

/* load existing users supplied from the server */
function loadUsers(users) {
  for (let u = 0; u < users.length; u++) {
    createSphere( users[u], colorNames[u], colors[u] );
  }
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
  document.getElementById('error-container').innerHTML = data.message;
  loadUsers(data.users);
});

socket.on('userExists', function(data) {
  document.getElementById('error-container').innerHTML = data;
});

socket.on('userSet', function(data) {
  user = data.username;
  //createSphere( user, colorNames[data.users.length-1], colors[data.users.length-1]);
  loadUsers(data.users);
  document.getElementById('login').innerHTML = 
   '<div id = "message-container"></div> \
    <div> \
	<input type = "text" id = "message"> \
	<button type = "button" name = "sendbutton" onclick = "sendMessage()">Send</button> \
    </div> \
    <div>' /* \
	<button style="width:'+100+'%; padding:'+4+'px;" type = "button" name = "playbutton" onclick = "play()">Play</button> \
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
  console.log(data);
  if(data.data.id < Spheres.length 
  && data.data.name != user 
  && data != undefined) {
    Spheres[data.data.id].readData(data.data);
  }
}); 