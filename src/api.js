var _ = require('lodash');

var db = require('./db/db');
var Route = require('./models/Route');
var Trip = require('./models/Trip');
var Step = require('./models/Step');

var pg = require('pg')
var private = require('./private');
var conString = 'postgres://' + private.db.user + ':' + private.db.pass + '@' + private.db.host + '/' + private.db.name;

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

		var sql = `
			select date_trunc('minute', "Trip".time) as time, "Step".duration
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
				var timeIso = row.time.toISOString();
				if (tripTimesAdded.indexOf(timeIso) === -1) {
					tripTimesAdded.push(timeIso);
					output.push({
						time: timeIso,
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

module.exports = {
	getRoutes: getRoutes,
	getRoute: getRoute
};
