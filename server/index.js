
// general idea behind server:
//   client connects:
//    -> send hi
//   updates:
//    -> updates objects according to game rules and user key input (stored in user object)
//    -> to all users who are in a valid room
//	-> send the state of the room (all spheres)
//   receives from client:
//    -> username -> sends userExists if user exists, otherwise sends userSet & adds the user to users
//    -> chat messages -> send to other users in room
//    -> input data -> change the boolean value of that key in user object
//    -> rematch request -> restart the match

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
var rooms = [];
//var savedSpheres = [];
var planets = [];
var moons = [];
var roomPrefix = "Room ";

function deleteUserBySocket(socket) {
  let userData = {};
  let userIndex = 0;
  if (sockets.length > 0) 
    for (let i = sockets.length - 1; i >= 0 ; --i) {
      if (sockets[i] == socket) {
        userData = { username:users[i], room:rooms[i]};	
        users.splice(i, 1);
        sockets.splice(i, 1);
        planets.splice(i, 1);
        moons.splice(i, 1);     
      }
    }

  return userData;
}

function planetOfNameExists(name) {
	for (let i = 0; i < planets.length; ++i)
		if (planets[i].name == name)
			return true;
	return false;
}

function moonOfNameExists(name) {
	for (let i = 0; i < moons.length; ++i)
		if (moons[i].name == name)
			return true;
	return false;
}

function getPlanetByName(name) {
	for (let i = 0; i < planets.length; ++i)
		if (planets[i].name == name)
			return planets[i];
}

function getMoonByName(name) {
	for (let i = 0; i < moons.length; ++i)
		if (moons[i].name == name)
			return moons[i];
}


function savePlanet(data) {
	for (let i = 0; i < planets.length; ++i)
		if (planets[i].name == data.name)
			planets[i] = data;
}

function saveMoon(data) {
	for (let i = 0; i < moons.length; ++i)
		if (moons[i].name == data.name)
			moons[i] = data;
}

function removePlanet(name) {
	for (let i = 0; i < planets.length; ++i)
		if (planets[i].name == name)
			planets.splice(i, 1);
}

function removeMoon(name) {
	for (let i = 0; i < moons.length; ++i)
		if (moons[i].name == name)
			moons.splice(i ,1);
}


function userOfNameExists(name) {
	for (let i = 0; i < users.length; ++i)
		if (users[i] == name)
			return true;
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
	  else if(data == "") {
	  	socket.emit('userExists', 'Name must indclude at least one character.');
	  }
	  else {
	        users.push(data);
	        sockets.push(socket);
  
		if(io.nsps['/moonshot'].adapter.rooms[roomPrefix+roomnum] 
		&& io.nsps['/moonshot'].adapter.rooms[roomPrefix+roomnum].length > 1) 
			roomnum++;
  
		if(!rooms.includes(roomPrefix+roomnum)) {
			rooms.push(roomPrefix+roomnum);
		}
  
		socket.join(roomPrefix+roomnum);
		socket.emit('userSet', {username: data, users:users, room:roomPrefix+roomnum});
  
		nsp.to(roomPrefix+roomnum).emit('newmsg', { user: data, message: ' joined '+roomPrefix+roomnum});
		nsp.to(roomPrefix+roomnum).emit('spawnAll', {username: data, users:users });
	  }
	});
  
	socket.on('msg', function(data) {
		nsp.in(data.room).emit('newmsg', data);
	});
	socket.on('saveData', function(data) {
		if(data != undefined) {
			if(data.data.type.includes('planet')) {
				if(!planetOfNameExists(data.data.name))
					planets.push(data.data);
				else
					savePlanet(data.data);
			}
			else if(data.data.type.includes('moon')) {
				if(!moonOfNameExists(data.data.name))
					moons.push(data.data);
				else
					saveMoon(data.data);
			}
		}
	});
	socket.on('retrieveData', function( data ) {
		if(data != undefined) {
			if(data.type.includes('planet')) {
				let myPlanet = getPlanetByName( data.name );
				socket.emit('loadData', myPlanet);
			}
			else if(data.type.includes('moon')) {
				let myMoon = getMoonByName( data.name );
				socket.emit('loadData', myMoon);
			}
		}
	});
	socket.on('testUserConnections', function(data) {
		if(!users.includes(data.name)) {
	    	/* send disconnect to clients */
    		nsp.to(data.room).emit('userDisconnect', data.name);
    		nsp.to(data.room).emit('newmsg', { user: data.name, message: ' disconnected from '+data.room});
			removePlanet(data.name);
			removeMoon(data.name);			
		}
	});
	socket.on('debug', function( key ) {
		switch(key.key) {
		  case 'rooms':
		  	console.log('Rooms');
			console.log(rooms);
		    break;
		  case 'users':
		  	console.log('Users');
			console.log(users);
		    break;
		  case 'planets':
		  	console.log('Planets');
			console.log(planets);
		    break;
		  case 'moons':
		  	console.log('Moons');
			console.log(moons);
		    break;
		  case 'sockets':
		  	for(let s = 0; s < sockets.length; s++) {
		  		console.log(sockets[s]);
		  	}
		    break;
		  default:
		}
	});
  
	socket.on('killUser', function( user ) {
		for(let u = 0; u < users.length; u++){
			if(users[u] == user) {
				nsp.to(roomPrefix+roomnum).emit('die', user);
				nsp.to(sockets[u].id).emit('rematch', { users:users });
			}
		}
	});
  
	socket.on('doRematch', function() {
		nsp.to(roomPrefix+roomnum).emit('removeChatDiv', 'rematch');
		nsp.to(roomPrefix+roomnum).emit('newmsg', { user: '', message: 'REMATCH!'});
		nsp.to(roomPrefix+roomnum).emit('spawnAll', { users:users });
	});
  
	socket.on('disconnect', function() {
		if (socket != "") {
			let socketUserData = deleteUserBySocket(socket);
			console.log('User '+socketUserData.username+' disconnected');
		}
	});
});

const port = 80;
http.listen(port, () => console.log(`Listening on port ${port}...`));
