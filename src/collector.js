var axios = require('axios');
var moment = require('moment-timezone');
var _ = require('lodash');

var pvt = require('./private');
var db = require('./db/db');
var utils = require('./utils');
var Route = require('./models/Route');
var BaseTrip = require('./models/BaseTrip');
var Trip = require('./models/Trip');
var BaseStep = require('./models/BaseStep');
var Step = require('./models/Step');
var CalculationQueueItem = require('./models/CalculationQueueItem');

var VERBOSE = false;

var isMorning;
var isEvening;

init();

function init() {
	var now = moment().tz(utils.TIMEZONE),
		destinationType;
	if (isInMorningCommuteWindow(now)) {
		destinationType = 'office';
	} else if (isInEveningCommuteWindow(now)) {
		destinationType = 'home';
	}

	if (destinationType !== undefined) {
		getRoutesAndBaseSteps(destinationType).then(function(routesAndBaseSteps) {
			_.forEach(routesAndBaseSteps, function(baseSteps, routeId) {
				isTimeSelected(routeId, now).then((isSelected) => {
					if (isSelected) {
						createTrip(routeId, destinationType).then(function(tripResult) {
							var tripId = tripResult[0].rows[0].id;
							mapStep(tripId, baseSteps).then(function(stepResult) {
								// Steps mapped correctly
							}).catch(function(error) {
								logError('Error in step mapping', error);
							});
						}).catch(function(error) {
							logError('Error in trip creation', error);
						});
					}
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
		'select "Route".id as "routeId", "BaseStep".id as "baseStepId", "BaseStep".index, "BaseStep"."startLat", "BaseStep"."startLon", "BaseStep"."endLat", "BaseStep"."endLon"',
		'from "Route", "BaseTrip", "BaseStep"',
		'where "BaseTrip"."destinationType" = $1',
		'and "BaseTrip".route = "Route".id',
		'and "BaseStep".trip = "BaseTrip".id',
		'order by "BaseStep".index asc'
	].join(' ');

	return new Promise(function(resolve, reject) {		
		db.rawQuery(sql, [destinationType]).then(function(result) {
			var output = _.groupBy(result.rows, 'routeId');
			resolve(output);
		}).catch(function(error) {
			reject(error);
		});
	});
}

function isTimeSelected(routeId, time) {
	return new Promise((resolve, reject) => {
		const dbTime = time.add(30, 'seconds').startOf('minute').format('HH:mm:ss+00');
		db.query(CalculationQueueItem, 'CalculationQueueItem', ['selected'], {
			route: routeId,
			time: dbTime
		}).then((result) => {
			if (result.rows.length === 0) {
				resolve(false);
			}
			resolve(result.rows[0].selected);
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

function mapStep(tripId, steps) {
	return new Promise(function(resolve, reject) {
		var step = steps.shift();
		if (step === undefined) {
			resolve();
		}
		var origin = step.startLat + ',' + step.startLon;
		var destination = step.endLat + ',' + step.endLon;
		axios.get('https://maps.googleapis.com/maps/api/directions/json', {
			params: {
				key: pvt.serverKey,
				origin: origin,
				destination: destination,
				departure_time: 'now'
			}
		}).then(function(response) {
			var mappedRoute = response.data.routes[0];
			var warnings = mappedRoute.warnings;
			if (warnings.length) {
				log('warnings!', warnings);
			}
			var leg = mappedRoute.legs[0];
			var duration = leg.duration_in_traffic.value;
			var stepPayload = [{
				baseStep: step.baseStepId,
				trip: tripId,
				duration: duration
			}];
			db.insert(Step, 'Step', stepPayload).then(function() {
				mapStep(tripId, steps).then(resolve).catch(function(error) {
					reject(error);
				});
			}).catch(function(error) {
				reject(error);
			});
		}).catch(function(error) {
			logError('Google Maps API call error!', error);
			reject(error);
		});
	});
}

function isInMorningCommuteWindow(momentInstance) {
	return momentInstance.isBetween(utils.morningStart, utils.morningEnd, 'minute', '[]')
}

function isInEveningCommuteWindow(momentInstance) {
	return momentInstance.isBetween(utils.eveningStart, utils.eveningEnd, 'minute', '[]')
}

function log() {
	console.log('[' + moment().format() + '] ', Array.prototype.slice.call(arguments));
}
function logError() {
	console.error('[' + moment().format() + '] ', Array.prototype.slice.call(arguments));
}
