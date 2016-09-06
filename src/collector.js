var axios = require('axios');
var moment = require('moment-timezone');
var _ = require('lodash');

var pvt = require('./private');
var db = require('./db/db');
var Route = require('./models/Route');
var BaseTrip = require('./models/BaseTrip');
var Trip = require('./models/Trip');
var BaseStep = require('./models/BaseStep');
var Step = require('./models/Step');

var VERBOSE = true;

var TIMEZONE = 'America/New_York';

var isMorning;
var isEvening;

init();

function init() {
	var now = moment().tz(TIMEZONE),
		destinationType;
	if (isInMorningCommuteWindow(now)) {
		destinationType = 'office';
	} else if (isInEveningCommuteWindow(now)) {
		destinationType = 'home';
	}

	if (destinationType !== undefined) {
		getRoutesAndBaseSteps(destinationType).then(function(routesAndBaseSteps) {
			_.forEach(routesAndBaseSteps, function(baseSteps, routeId) {
				createTrip(routeId, destinationType).then(function(tripResult) {
					mapStep(tripResult[0].rows[0].id, baseSteps, new Date().getTime()).then(function(stepResult) {
						console.log('Steps mapped correctly', stepResult);
					}).catch(function(error) {
						logError('Error in step mapping', error);
					});
				}).catch(function(error) {
					logError('Error in trip creation', error);
				});
			});
		}).catch(function(error) {
			logError('Error in retrieving routes and base steps', error);
		});
	} else {
		if (VERBOSE) {
			log('The time is not currently within commute windows.');
		}
	}
}

function getRoutesAndBaseSteps(destinationType) {
	var sql = [
		'select "Route".id as "routeId", "BaseStep".index, "BaseStep"."startLat", "BaseStep"."startLon", "BaseStep"."endLat", "BaseStep"."endLon"',
		'from "Route", "BaseTrip", "BaseStep"',
		'where "BaseTrip"."destinationType" = $1',
		'and "BaseTrip".route = "Route".id',
		'and "BaseStep".trip = "BaseTrip".id',
		'order by "BaseStep".index asc'
	].join(' ');

	return new Promise(function(resolve, reject) {		
		db.rawQuery(sql, [destinationType]).then(function(result) {
			var output = _.groupBy(result.rows, 'routeId');
			console.log('output', output);
			resolve(output);
		}).catch(function(error) {
			reject(error);
		});
	});
}

function createTrip(routeId, destinationType) {
	var tripPayload = {
		route: routeId,
		destinationType: destinationType
	};
	console.log(tripPayload);
	return db.insert(Trip, 'Trip', [tripPayload]);
}

function mapStep(tripId, steps, timestamp) {
	return new Promise(function(resolve, reject) {
		var step = steps.shift();

	});
}

function mapRoute(route) {
	var origin;
	var destination;
	var destinationType;

	if (isMorning) {
		origin = route.home;
		destination = route.office;
		destinationType = 'office';
	} else if (isEvening) {
		origin = route.office;
		destination = route.home;
		destinationType = 'home';
	}

	if (origin !== undefined) {
		axios.get('https://maps.googleapis.com/maps/api/directions/json', {
				params: {
					key: pvt.serverKey,
					origin: origin,
					destination: destination
				}
			})
			.then(function(response) {
				var mappedRoute = response.data.routes[0];
				var warnings = mappedRoute.warnings;
				if (warnings.length) {
					log('warnings!', warnings);
				}
				var trip = mappedRoute.legs[0];
				var steps = trip.steps;

				var tripPayload = {
					route: route.id,
					destinationType: destinationType
				};
				var tripPromise = db.insert(Trip, 'Trip', [tripPayload]);

				tripPromise.then(function(tripResult) {
					var tripId = tripResult[0].rows[0].id;
					log('Inserted new trip ID', tripId);
					var stepPayload = steps.map(function(step, index) {
						return {
							trip: tripId,
							index: index,
							duration: step.duration.value,
							coords: JSON.stringify(step.start_location) + JSON.stringify(step.end_location)
						};
					});
					db.insert(Step, 'Step', stepPayload)
						.then(function(stepResult) {
							if (VERBOSE) {
								log('Inserted new step IDs', stepResult.map(function(result) {
									return result.rows[0].id;
								}));
							}
						}).catch(function(error) {
							logError('Step insert failed!', error);
						});
				}).catch(function(error) {
					logError('Trip insert failed!', error);
				});
			})
			.catch(function(error) {
				logError('Google Maps API call error!', error);
			});
	}
}

function isInMorningCommuteWindow(momentInstance) {
	return true;
	var morningStart = moment().tz(TIMEZONE).set({
		hour: 5,
		minute: 0,
		second: 0
	});
	var morningEnd = moment().tz(TIMEZONE).set({
		hour: 9,
		minute: 30,
		second: 0
	});
	return momentInstance.isBetween(morningStart, morningEnd, null, '[]')
}

function isInEveningCommuteWindow(momentInstance) {
	var eveningStart = moment().tz(TIMEZONE).set({
		hour: 3 + 12,
		minute: 0,
		second: 0
	});
	var eveningEnd = moment().tz(TIMEZONE).set({
		hour: 7 + 12,
		minute: 30,
		second: 0
	});
	return momentInstance.isBetween(eveningStart, eveningEnd, null, '[]')
}

function log() {
	console.log('[' + moment().format() + '] ', Array.prototype.slice.call(arguments));
}
function logError() {
	console.error('[' + moment().format() + '] ', Array.prototype.slice.call(arguments));
}

