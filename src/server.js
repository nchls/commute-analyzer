var hapi = require('hapi');
var moment = require('moment-timezone');

var api = require('./api');

var server = new hapi.Server();

server.connection({
	port: 29090
});

var routeView = function(request, reply) {

	// TODO: fix this for local dev
	request.params.route = request.params.route.replace('commute-api/', '');

	// '2017-03-24T20:00:00'
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

server.route({
	method: 'GET',
	path: '/routes',
	handler: routesView
});

// TODO: fix this for local dev
server.route({
	method: 'GET',
	path: '/commute-api/routes',
	handler: routesView
});

server.route({
	method: 'GET',
	path: '/{route*}',
	handler: routeView
});

server.start(function() {
	console.log('Server running at:', server.info.uri);
});
