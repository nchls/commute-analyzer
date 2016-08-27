var axios = require('axios');
var moment = require('moment-timezone');

var pvt = require('./private');
var db = require('./db/db');
var Route = require('./models/Route');
var Trip = require('./models/Trip');
var Step = require('./models/Step');

var TIMEZONE = 'America/New_York';

var isMorning;
var isEvening;

init();

function init() {
	var now = moment().tz(TIMEZONE);

	isMorning = isInMorningCommuteWindow(now);
	isEvening = isInEveningCommuteWindow(now);

	if (isMorning || isEvening) {
		var routesPromise = getRoutes();
		routesPromise.then(function(routes) {
			routes.rows.forEach(mapRoute);
		}).catch(function(error) {
			console.error('Routes query failed!', error);
		});
	} else {
		console.log('The time is not currently within commute windows.');
	}
}

function getRoutes() {
	return db.query(Route, 'Route', ['*']);
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
					console.log('warnings!', warnings);
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
					var stepPayload = steps.map(function(step, index) {
						return {
							trip: tripId,
							index: index,
							duration: step.duration.value,
							coords: JSON.stringify(step.start_location) + JSON.stringify(step.end_location)
						};
					});
					db.insert(Step, 'Step', stepPayload).catch(function(error) {
						console.error('Step insert failed!', error);
					});
				}).catch(function(error) {
					console.error('Trip insert failed!', error);
				});
			})
			.catch(function(error) {
				console.error('error!', error);
			});
	}
}

function isInMorningCommuteWindow(momentInstance) {
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
		hour: 9 + 12,
		minute: 30,
		second: 0
	});
	return momentInstance.isBetween(eveningStart, eveningEnd, null, '[]')
}
