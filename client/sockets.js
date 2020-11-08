
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
	];
var user_start_positions = 
  [
    {x:100,y:100},
    {x:500,y:500},
    {x:100,y:100},
    {x:100,y:100},
    {x:100,y:100},
  ];

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
		 user_colors[u % user_colors.length].color,
      user_start_positions[u % user_start_positions.length]);
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
    socket.emit('msg', {message: msg, user: user, room: room});
  }
}

/* save your sphere position to the server */
function saveSphereData(data) {
  socket.emit('saveData', { data:data, room:room });
}

/* retrieve a sphere position from the server by id */
function retrieveSphereData( name, type ) {
  socket.emit('retrieveData', { name:name, type:type } );
}

/* looks to see if user of spheres still exists*/
function checkUserStillExists() {
  for(let sp = 0; sp < Spheres.length; sp+=2) {
    socket.emit('testUserConnections', { name:Spheres[sp].name, room:room } );
  }
}

/* debug to console */
function keyPressed() {
  if (keyCode === 82) // if `r` key is pressed
    socket.emit('debug', { key:'rooms' } );
  else if (keyCode === 85) // if `u` key is pressed
    socket.emit('debug', { key:'users' } );
  else if (keyCode === 80) // if `p` key is pressed
    socket.emit('debug', { key:'planets' } );
  else if (keyCode === 77) // if `m` key is pressed
    socket.emit('debug', { key:'moons' } );
  else if (keyCode === 88) // if `x` key is pressed
    socket.emit('debug', { key:'sockets' } );
}

function die(user) {
  socket.emit('killUser', user );
};

function rematch(data) {
  socket.emit('doRematch' );
};

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

  let initial_msg = "Welcome to "+data.room;
  document.getElementById('login').innerHTML = 
   '<div> \
	   <input type = "text" id = "message"> \
	   <button type = "button" name = "sendbutton" onclick = "sendMessage()">Send</button> \
    </div>\
    <div id = "message-container">'+initial_msg+'</div>'
  ;
});

socket.on('rematch', function() {
  document.getElementById('message-container').innerHTML += '<div id = "rematch" > \
     <button type = "button" name = "rematchButton" onclick = "rematch()">Rematch?</button> \
    </div>'
  ;
});

socket.on('removeChatDiv', function( id ) {
  let removeMe = document.getElementById(id);
  if(removeMe)
    removeMe.parentNode.removeChild(removeMe);
  ;
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

socket.on('spawnAll', function(data) {
  Spheres = [];
  loadUsers(data.users);
}); 

socket.on('loadData', function(data) {
  if(data != undefined) {
    for (let i = 0; i < Spheres.length; i++ ) {
      if (Spheres[i].name == data.name &&  Spheres[i].type == data.type ) {
        Spheres[i].readData(data);
      }
    }
  }
});

socket.on('userDisconnect', function(username) {
  if (Spheres.length > 0)
    for (let i = Spheres.length - 1; i >= 0 ; --i)
      if (Spheres[i].name == username && username != user) {
        Spheres.splice(i, 1);
      }
});

socket.on('debug_to_web_console', function(data) {
  console.log( data );
});

socket.on('die', function( deceased ) {
  if (Spheres.length > 0)
    for (let i = Spheres.length - 1; i >= 0 ; --i)
      if (Spheres[i].name == deceased) {
        Spheres.splice(i, 1);
      }

});