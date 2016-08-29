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

var getRoute = function(slug) {
	return new Promise(function(resolve, reject) {
		pg.connect(conString, function(err, client, done) {
			if (err) {
				return reject('Error fetching client from pool', err);
			}

			var minSql = [
				'select "Step".coords, min("Step".duration)',
				'from "Route", "Trip", "Step"',
				'where "Route".slug = $1',
				'and "Trip".route = "Route".id',
				'and "Step".trip = "Trip".id',
				'group by coords',
			].join(' ');

			var sql = [
				'select "Trip".id, "Trip".time, "Step".index, "Step".duration',
				'from "Route", "Trip", "Step"',
				'where "Route".slug = $1',
				'and "Trip".route = "Route".id',
				'and "Step".trip = "Trip".id',
				'order by "Trip".time'
			].join(' ');
			client.query(sql, ['pownal'], function(err, result) {
				done();
				var output = {};
				result.rows.forEach(function(row) {
					if (output[row.id] === undefined) {
						output[row.id] = {
							time: row.time,
							steps: []
						};
					}
					output[row.id].steps.push({
						index: row.index,
						duration: row.duration
					});
				});
				resolve(output);
			}).catch(function(error) {
				done();
				reject(error);
			});
		});
	});
};

module.exports = {
	getRoutes: getRoutes,
	getRoute: getRoute
};
