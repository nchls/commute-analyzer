var pg = require('pg'),
	q = require('q'),
	_ = require('lodash');

var private = require('../private');

var conString = 'postgres://' + private.db.user + ':' + private.db.pass + '@' + private.db.host + '/' + private.db.name;

var runInsertOrUpdate = function(model, rows) {
	var deferred = q.defer();

	pg.connect(conString, function(err, client, done) {
		if (err) {
			return deferred.reject('Error fetching client from pool', err);
		}

		var rowsCount = rows.length;
		var results = [];

		rows.forEach(function(row) {
			client.query(row.sql, row.parameters, function(err, result) {
				if (err) {
					deferred.reject(JSON.stringify({msg: 'Error running query', err: err}));
				}
				result = formatPgData(model, result);
				results.push(result);

				if (results.length === rowsCount) {
					done();
					deferred.resolve(results);
				}
			});

		});

	});

	return deferred.promise;
},

rawQuery = function(sql, parameters) {
	return new Promise(function(resolve, reject) {
		pg.connect(conString, function(err, client, done) {
			if (err) {
				return reject('Error fetching client from pool', err);
			}
			client.query(sql, parameters, function(err, result) {
				done();
				if (err) {
					console.log('err', err, 'result', result);
					return reject(err);
				}
				resolve(result);
			}).catch(function(error) {
				done();
				reject(error);
			});
		});
	});
};

query = function(model, table, columns, criteria) {
	var deferred = q.defer();

	pg.connect(conString, function(err, client, done) {
		if (err) {
			console.error(err);
			return deferred.reject('Error fetching client from pool', err);
		}

		var whereClause;
		var parameters;
		if (criteria !== undefined) {
			whereClause = objToSetOrWhereClause(criteria, 'where');
			var parameterizedWhereClause = parameterizeClauses([whereClause]);
			whereClause = ' where ' + parameterizedWhereClause[0];
			parameters = parameterizedWhereClause[1];
		} else {
			whereClause = '';
			parameters = [];
		}

		var sql = 'select ' + columns.join(',') + ' from "' + table + '"' + whereClause;

		client.query(sql, parameters, function(err, result) {
			done();
			if (err) {
				console.error(err);
				return deferred.reject(JSON.stringify({msg: 'Error running query', err: err}));
			} else {
				result = formatPgData(model, result);
				return deferred.resolve(result);
			}
		});

	});

	return deferred.promise;
}

insert = function(model, table, rows) {
	var formattedRows = rows.map(function(row) {
		return getInsertSQL(table, row);
	});

	return runInsertOrUpdate(model, formattedRows);
},

getInsertSQL = function(table, row) {
	var valuesClause = objToValuesClause(row),
		parameterizedClauses = parameterizeClauses([valuesClause]),
		parameters;

	valuesClause = parameterizedClauses[0];
	parameters = parameterizedClauses[1];

	sql = 'insert into "' + table + '" ' + valuesClause + ' returning id;';

	return {
		sql: sql,
		parameters: parameters
	}
},

update = function(model, table, criteria, obj) {
	var sql = '',
		whereClause = objToSetOrWhereClause(criteria, 'where'),
		setClause = objToSetOrWhereClause(obj, 'set'),
		parameterizedClauses = parameterizeClauses([setClause, whereClause]),
		parameters = [];

	setClause = parameterizedClauses[0];
	whereClause = parameterizedClauses[1];
	parameters = parameterizedClauses[2];

	sql = 'update "' + table + '" set ' + setClause + ' where ' + whereClause + ';';

	return runInsertOrUpdate(model, sql, parameters);
},

objToValuesClause = function(obj) {
	var output = [],
		keys = _.keys(obj),
		vals = _.values(obj);

	var formattedKeys = formatKeys(keys);

	var formattedVals = _.map(vals, function(val) {
		return '$param';
	});

	output.push('(' + formattedKeys.join(',') + ') values (' + formattedVals.join(',') + ')');
	output.push(vals);

	return output;
},

objToSetOrWhereClause = function(obj, setOrWhere) {
	var output = [],
		keys = _.keys(obj),
		vals = _.values(obj),
		formattedKeys = formatKeys(keys),
		formattedVals = _.map(vals, function(val, idx) {
			return '$param';
		}),
		zipped = _.zipObject(formattedKeys, formattedVals),
		joiner = (setOrWhere === 'set' ? ', ' : ' and ');

	zipped = _.map(zipped, function(val, key) {
		return key + ' = ' + val;
	});
	zipped = zipped.join(joiner);

	output.push(zipped);
	output.push(vals);

	return output;
},

formatKeys = function(keys) {
	return _.map(keys, function(key) {
		if (hasCap(key) || key === 'order') {
			return '"' + key + '"';
		}
		return key;
	});
},

hasCap = function(str) {
	for (var i=0, l=str.length; i < l; i++) {
		if (str[i] === str[i].toUpperCase()) {
			return true;
		}
	}
	return false;
},

parameterizeClauses = function(clauses) {
	var parameters = [],
		parameterIdx = 1,
		output = [];

	_.forEach(clauses, function(clause) {
		while (clause[0].indexOf('$param') !== -1) {
			clause[0] = clause[0].replace('$param', '$' + parameterIdx);
			parameterIdx++;
		}
		parameters = parameters.concat(clause[1]);
		output.push(clause[0]);
	});

	output.push(parameters);

	return output;
},

formatPgData = function(model, data) {
	var schema = model.schema;

	if (data !== undefined) {
		_.forEach(data.rows, function(row, rowIdx) {
			_.forEach(row, function(val, key) {

				if (val === null) {
					delete data.rows[rowIdx][key];
					return;
				}

				var propSchema = schema[key],
					newVal;
				if (propSchema) {
					if (propSchema.type === 'numeric') {
						newVal = parseFloat(val);
					} else if (_.includes(['int', 'smallint'], propSchema.type)) {
						newVal = parseInt(val, 10);
					} else if (propSchema.type === 'date' && val !== null) {
						newVal = val.toISOString().split('T')[0];
					}
				}
				if (newVal !== undefined) {
					data.rows[rowIdx][key] = newVal;
				}

			});
		});
	}

	return data;
};

module.exports = {
	query: query,
	rawQuery: rawQuery,
	insert: insert,
	update: update
};
