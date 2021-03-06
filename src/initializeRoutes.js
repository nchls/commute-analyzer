var axios = require('axios');

var pvt = require('./private');
var db = require('./db/db');
var utils = require('./utils');
var Route = require('./models/Route');
var BaseTrip = require('./models/BaseTrip');
var BaseStep = require('./models/BaseStep');
var CalculationQueueItem = require('./models/CalculationQueueItem');

init();

function init() {
	getRoutes().then(function(routes) {
		routes.rows.forEach(initializeRoute);
	}).catch(function(error) {
		console.error('Routes query failed!', error);
	});
}

function getRoutes() {
	return db.query(Route, 'Route', ['id', 'home', 'office']);
}

function initializeRoute(route) {
	var sql = `
		select "BaseStep".index, "BaseStep"."startLat", "BaseStep"."startLon", "BaseStep"."endLat", "BaseStep"."endLon"
		from "Route"
		join "BaseTrip" on "BaseTrip".route = $1
		join "BaseStep" on "BaseStep".trip = "BaseTrip".id
		where "BaseTrip"."destinationType" = $2
	`;

	['office', 'home'].forEach(function(destinationType) {
		db.rawQuery(sql, [route.id, destinationType]).then(function(result) {
			if (result.rows.length === 0) {
				console.log('Base trip for route ' + route.id + ' and destination ' + destinationType + ' is missing!');
				mapBaseRoute(route, destinationType);
			} else {
				console.log('Base trip for route ' + route.id + ' and destination ' + destinationType + ' already exists. Skipping.');
			}
		}).catch(function(error) {
			console.error('Failed to select steps from route!', error);
		});
	});
}

function mapBaseRoute(route, destinationType) {
	var origin,
		destination;
	if (destinationType === 'office') {
		origin = route.home;
		destination = route.office;
	} else {
		origin = route.office;
		destination = route.home;
	}

	return new Promise(function(resolve, reject) {
		axios.get('https://maps.googleapis.com/maps/api/directions/json', {
			params: {
				key: pvt.serverKey,
				origin: origin,
				destination: destination
			}
		}).then(function(response) {
			var mappedRoute = response.data.routes[0];
			var trip = mappedRoute.legs[0];
			var steps = trip.steps;

			var tripPayload = {
				route: route.id,
				destinationType: destinationType
			};
			var tripPromise = db.insert(BaseTrip, 'BaseTrip', [tripPayload]);

			tripPromise.then(function(tripResult) {
				var tripId = tripResult[0].rows[0].id;
				console.log('Inserted new trip ID', tripId);
				var stepPayload = steps.map(function(step, index) {
					return {
						trip: tripId,
						index: index,
						startLat: step.start_location.lat,
						startLon: step.start_location.lng,
						endLat: step.end_location.lat,
						endLon: step.end_location.lng
					};
				});
				db.insert(BaseStep, 'BaseStep', stepPayload)
					.then(function(stepResult) {
						var baseStepIds = stepResult.map(function(result) {
							return result.rows[0].id;
						});
						console.log('Inserted new base step IDs', baseStepIds);
						resolve(baseStepIds);
					}).catch(function(error) {
						console.error('Step insert failed!', error);
						reject(error);
					});
			}).catch(function(error) {
				console.error('Trip insert failed!', error);
				reject(error);
			});
		}).catch(function(error) {
			console.error('Google Maps API request failed!', error);
			reject(error);
		});			
	});
}
