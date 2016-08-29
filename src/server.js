var hapi = require('hapi');

var api = require('./api');

var server = new hapi.Server();

server.connection({
	port: 8081
});

server.route({
	method: 'GET',
	path: '/',
	handler: function(request, reply) {
		api.getRoutes().then(function(routeResponse) {
			reply(routeResponse);
		}).catch(function(error) {
			reply(error);
		});
	}
});

server.route({
	method: 'GET',
	path: '/pownal',
	handler: function(request, reply) {
		api.getRoute('pownal').then(function(routeResponse) {
			reply(routeResponse);
		}).catch(function(error) {
			reply(error);
		});
	}
});

server.start(function() {
	console.log('Server running at:', server.info.uri);
});
