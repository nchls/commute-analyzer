var hapi = require('hapi');
var inert = require('inert');
var moment = require('moment-timezone');

var api = require('./api');

var server = new hapi.Server();

server.connection({
	port: 29090
});

var routeView = function(request, reply) {
	const now = moment().tz('America/New_York');
	const ymd = now.format('YYYY-MM-DD');
	const isAfternoon = now.isAfter(moment().tz('America/New_York').hours(12).minutes(0).seconds(0));
	const destination = (isAfternoon ? 'home' : 'office');
	api.getRoute(request.params.route, destination, ymd).then(function(routeResponse) {
		reply(routeResponse);
	}).catch(function(error) {
		reply(error);
	});
};

var routesView = function(request, reply) {
	api.getRoutes().then(function(routesResponse) {
		reply(routesResponse);
	}).catch(function(error) {
		reply(error);
	});
};

server.register(inert, function(err) {

	if (err) {
		throw err;
	}

	server.route({
		method: 'GET',
		path: '/api/routes',
		handler: routesView
	});

	server.route({
		method: 'GET',
		path: '/api/route/{route*}',
		handler: routeView
	});

	server.route({
		method: 'GET',
		path: '/static/{path*}',
		handler: {
			directory: {
				path: 'dist'
			}
		}
	});

	server.route({
		method: 'GET',
		path: '/{path*}',
		handler: function(request, reply) {
			reply.file('./dist/index.html');
		}
	});

	server.start(function() {
		console.log('Server running at:', server.info.uri);
	});

});

