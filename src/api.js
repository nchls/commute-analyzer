var _ = require('lodash');

var db = require('./db/db');
var Route = require('./models/Route');
var Trip = require('./models/Trip');
var Step = require('./models/Step');

var getRoutes = function() {
	return new Promise(function(resolve, reject) {
		db.query(Route, 'Route', ['name', 'slug']).then(function(response) {
			resolve(response.rows);
		}).catch(function(error) {
			reject(error);
		});
	});
};

var getRoute = function(slug, destination, ymd) {
	return new Promise(function(resolve, reject) {

		Promise.all([
			getActualTravelTimes(slug, destination, ymd),
			getProjectedTravelTimes(slug, destination)
		]).then((travelTimes) => {

			const output = [];
			const actualTravelTimes = travelTimes[0];
			const projectedTravelTimes = travelTimes[1];

			for (var i=0, l=projectedTravelTimes.length; i<l; i++) {
				const projectedTravelTime = projectedTravelTimes[i];
				const stepsCount = projectedTravelTime.durations.length;
				const projectedTime = projectedTravelTime.time;
				const actualTime = actualTravelTimes.find((candidateTime) => {
					return (candidateTime.time === projectedTime && candidateTime.durations.length === stepsCount);
				});
				if (actualTime !== undefined) {
					actualTime.isActual = true;
					output.push(actualTime);
					continue;
				}
				output.push(projectedTravelTime);
			}

			resolve(output);

		}).catch((error) => {

			console.error(error);
			reject(error);

		});

	});
};

const getActualTravelTimes = (slug, destination, ymd) => {
	return new Promise(function(resolve, reject) {
		const sql = `
			select cast(date_trunc('minute', "Trip".time) as time) as triptime, "Step".duration
			from "Step", "BaseStep", "BaseTrip", "Trip", "Route"
			where "Route".slug = $1
			and "Trip".route = "Route".id
			and "BaseStep".trip = "BaseTrip".id
			and "Step"."baseStep" = "BaseStep".id
			and "BaseTrip"."destinationType" = $2
			and "Step".trip = "Trip".id
			and cast("Trip".time as date) = $3
			order by "Trip".time asc, "BaseStep".index asc
		`;

		db.rawQuery(sql, [slug, destination, ymd]).then(function(result) {
			var tripTimesAdded = [];
			var output = [];
			result.rows.forEach(function(row) {
				const tripTime = row.triptime;
				if (tripTimesAdded.indexOf(tripTime) === -1) {
					tripTimesAdded.push(tripTime);
					output.push({
						time: tripTime,
						durations: [],
						sum: 0
					});
				}
				output[output.length-1].durations.push(row.duration);
				output[output.length-1].sum += row.duration;
			});
			resolve(output);
		}).catch(function(error) {
			console.error(error);
			reject(error);
		});
	});
};

const getProjectedTravelTimes = (slug, destination) => {
	return new Promise(function(resolve, reject) {
		const sql = `
			select cast(date_trunc('minute', "Trip".time) as time) as triptime, round(avg("Step".duration)) as averageduration
			from "Step", "BaseStep", "BaseTrip", "Trip", "Route"
			where "Route".slug = $1
			and "Trip".route = "Route".id
			and "BaseStep".trip = "BaseTrip".id
			and "Step"."baseStep" = "BaseStep".id
			and "BaseTrip"."destinationType" = $2
			and "Step".trip = "Trip".id
			group by triptime, "BaseStep".index
			order by triptime asc, "BaseStep".index asc
		`;

		db.rawQuery(sql, [slug, destination]).then(function(result) {
			var tripTimesAdded = [];
			var output = [];
			result.rows.forEach(function(row) {
				const tripTime = row.triptime;
				const avgDuration = parseFloat(row.averageduration);
				if (tripTimesAdded.indexOf(tripTime) === -1) {
					tripTimesAdded.push(tripTime);
					output.push({
						time: tripTime,
						durations: [],
						sum: 0
					});
				}
				output[output.length-1].durations.push(avgDuration);
				output[output.length-1].sum += avgDuration;
			});
			resolve(output);
		}).catch(function(error) {
			console.error(error);
			reject(error);
		});
	});
};

module.exports = {
	getRoutes: getRoutes,
	getRoute: getRoute
};
