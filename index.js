const fs = require('fs');
const express = require('express');
const path = require('path');
const app = express();
const http = require('http').Server(app);
const publicDirectoryPath = path.join(__dirname, '../Multiplayer Node Express App/Moon_Shot');
const staticDirectory =  express.static(publicDirectoryPath);

app.use(staticDirectory);
app.use(express.json());

app.get('/', (req, res) => {
	fs.readFile('../Moon_Shot/index.html', 'utf8', function(err, content) {
		res.send(content);
	});
});

var io = require('socket.io')(http);
var nsp = io.of('/moonshot');
var roomnum = 1;
var users = [];
var savedSpheres = [];

nsp.on('connection', function(socket) {
	//console.log('A user connected');

	socket.join("Lobby");
	socket.emit('setRoom', { room: 'Lobby'} );
	io.of('/moonshot').in('Lobby').emit('hi', {users:users,message:'Welcome to the lobby!'});

	socket.on('setUsername', function(data) {	  
	  if(users.indexOf(data) > -1) {
	     socket.emit('userExists', data + ' username is taken! Try some other username.');
	  } else {
	     users.push(data);
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
	  io.of('/moonshot').in("room-1").emit('loadData', savedSpheres[data.data.id] );
	});
	// socket.on('retrieveData', function(id) {
	//   //console.log(data.data.posX);
	//   //console.log(savedSpheres[id].data.id);
	//   	if( savedSpheres[id] != undefined ) {
	//   		socket.emit('loadData', savedSpheres[id] );
	// 	}
	// });
});

const port = 3000;//process.env.PORT || 3000
http.listen(port, () => console.log(`Listening on port ${port}...`));
