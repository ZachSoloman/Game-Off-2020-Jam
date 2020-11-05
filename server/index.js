
const fs = require('fs');
const express = require('express');
const path = require('path');
const app = express();
const http = require('http').Server(app);
const publicDirectoryPath = path.join(__dirname, '../client');
const staticDirectory =  express.static(publicDirectoryPath);

app.use(staticDirectory);
app.use(express.json());

app.get('/', (req, res) => {
	fs.readFile('../client/index.html', 'utf8', function(err, content) {
		res.send(content);
	});
});

var io = require('socket.io')(http);
var nsp = io.of('/moonshot');
var roomnum = 1;
var sockets = [];
var users = [];
var savedSpheres = [];

function deleteUserBySocket(socket) {
  var username = "";
  if (sockets.length < 0) 
    for (let i = sockets.length - 1; i >= 0 ; --i) {
      if (sockets[i] == socket) {

        username = users[i];
        users.splice(i, 1);
        savedSpheres.splice(i, 1);
        sockets.splice(i, 1);
      }
    }
  return username;
}

function userOfNameExists(name) {
  for (let i = 0; i < users.length; ++i) {
    if (users[i].username == name)
      return true;
  }
  return false;
}

nsp.on('connection', function(socket) {
	console.log('A user connected');

	socket.join("Lobby");
	socket.emit('setRoom', { room: 'Lobby'} );
	io.of('/moonshot').in('Lobby').emit('hi', {users:users,message:'Welcome to the lobby!'});

	socket.on('setUsername', function(data) {	  
	  if (userOfNameExists(data)) {
	     socket.emit('userExists', data + ' username is taken! Try some other username.');
	  } 
	  else {
	        users.push(data);
	        sockets.push(socket);
	        socket.emit('userSet', {username: data, users:users });
		if(io.nsps['/moonshot'].adapter.rooms["room-"+roomnum] 
		&& io.nsps['/moonshot'].adapter.rooms["room-"+roomnum].length > 1) 
			roomnum++;
		socket.join("room-"+roomnum);
		socket.emit('setRoom', { room: "room-"+roomnum} );

		console.log(''+data+' joined room '+roomnum);
		io.of('/moonshot').in("room-"+roomnum).emit('newmsg', { user: data, message: ' joined Room #'+roomnum});
		socket.to("room-"+roomnum).emit('spawnAll', {username: data, users:users });  
	  }

	  console.log(users);
	});

	socket.on('msg', function(data) {
	  io.of('/moonshot').in(data.room).emit('newmsg', data);
	});
	socket.on('getRoom', function(data) {
		if(io.nsps['/moonshot'].adapter.rooms["room-"+roomnum] 
		&& io.nsps['/moonshot'].adapter.rooms["room-"+roomnum].length > 1) 
			roomnum++;
		socket.join("room-"+roomnum);
		socket.emit('setRoom', { room: "room-"+roomnum} );

		console.log(''+data.user+' joined room '+roomnum);
		io.of('/moonshot').in("room-"+roomnum).emit('newmsg', { user: data.user, message: ' joined Room #'+roomnum});
	});
	socket.on('saveData', function(data) {
	  //console.log(data.data.posX);
	  savedSpheres[data.data.id] = data;
	  io.of('/moonshot').in("room-1").emit('loadData', savedSpheres[data.data.id]);
	});
	socket.on('retrieveData', function(id) {
	  //console.log(data.data.posX);
	  //console.log(savedSpheres[id].data.id);
	  if(savedSpheres[id] != undefined) {
	    socket.emit('loadData', savedSpheres[id] );
	  }
	});
	socket.on('disconnect', function() {

	  if (username != "") {
	    var username = deleteUserBySocket(socket);
	    /* send disconnect to clients */
	    io.of('/moonshot').in("room-1").emit('userDisconnect', username);
	    	  console.log('Got disconnect! '+username);
	  }
	});
});

const port = 80;
http.listen(port, () => console.log(`Listening on port ${port}...`));
