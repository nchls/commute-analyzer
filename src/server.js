const hapi = require('hapi');
const socketIo = require('socket.io');

const server = new hapi.Server();

server.connection({
	port: 29090
});

const io = socketIo(server.listener, {serveClient: false});

io.on('connection', function(socket) {
	socket.emit('oh hi!');
	socket.on('burp', function() {
		socket.emit('excuse you');
	});
});

/*
server.route({
	method: 'GET',
	path: '/',
	handler: function(request, reply) {
		reply('route to api');
	}
});
*/

server.start(function() {
	console.log('Server running at:', server.info.uri);
});
