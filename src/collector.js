var axios = require('axios');
var keys = require('./private');
var db = require('./db/db');

var Route = require('./models/Route');
var Trip = require('./models/Trip');
var Step = require('./models/Step');

var routePayload = {
	name: 'Pownal',
	slug: 'pownal',
	origin: '25 Pearl St., Portland, ME',
	destination: '354 Brown Road, Pownal, ME'
};
var routePromise = db.insert(Route, 'Route', [routePayload]);

axios.get('https://maps.googleapis.com/maps/api/directions/json', {
		params: {
			key: keys.serverKey,
			origin: '25 Pearl St., Portland, ME',
			destination: '354 Brown Road, Pownal, ME'
		}
	})
	.then(function(response) {
		var route = response.data.routes[0];
		var warnings = route.warnings;
		if (warnings.length) {
			console.log('warnings!', warnings);
		}
		var trip = route.legs[0];
		var steps = trip.steps;

		routePromise.then(function(routeResult) {
			var routeId = routeResult[0].rows[0].id;
			var tripPayload = {
				route: routeId
			};
			var tripPromise = db.insert(Trip, 'Trip', [tripPayload]);

			tripPromise.then(function(tripResult) {
				var tripId = tripResult[0].rows[0].id;
				var stepPayload = steps.map(function(step, index) {
					return {
						trip: tripId,
						index: index,
						duration: step.duration.value
					};
				});
				db.insert(Step, 'Step', stepPayload).catch(function(error) {
					console.error('Step insert failed!', error);
				});
			}).catch(function(error) {
				console.error('Trip insert failed!', error);
			});
		}).catch(function(error) {
			console.error('Route insert failed!', error);
		});
	})
	.catch(function(error) {
		console.log('error!', error);
	});
