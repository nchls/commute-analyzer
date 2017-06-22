const pvt = require('./private');
const db = require('./db/db');
const utils = require('./utils');
const CalculationQueueItem = require('./models/CalculationQueueItem');

const GOOGLE_DAILY_QUOTA = 2500

const ranker = () => {
	const minutes = getMinutesInCommuteWindows();

	const routesPromise = getRoutesAndStepCounts();

	routesPromise.then((result) => {

		const calculationQueueItems = [];

		const routeIds = new Set();
		const stepCounts = {};

		for (let i=0, l=result.rows.length; i<l; i++) {
			const row = result.rows[i];
			const routeId = row.id;
			const destinationType = row.destinationType;
			const stepCount = row.count;

			routeIds.add(row.id);
			stepCounts[routeId] = stepCounts[routeId] || {};
			stepCounts[routeId][destinationType] = parseInt(stepCount);
		}

		routeIds.forEach((routeId) => {
			for (let j=0, m=minutes.length; j<m; j++) {
				const minute = minutes[j];
				calculationQueueItems.push({
					minute: minute,
					route: routeId
				});
			}
		});

		const calculationCountsByRouteAndTimePromise = getCalculationCountsbyRouteAndTime();

		const calculationCounts = {};
		let highestCount = 0;
		calculationCountsByRouteAndTimePromise.then((subResult) => {
			for (let i=0, l=subResult.rows.length; i<l; i++) {
				const row = subResult.rows[i];

				const timeResults = row.timeresults.replace(/[\(\)]/g, '').split(',');
				const routeId = timeResults[0];
				const minute = timeResults[1];

				const count = parseInt(row.count, 10);
				if (count > highestCount) {
					highestCount = count;
				}

				const key = routeId + '~' + minute;
				calculationCounts[key] = count;
			}

			let calculationQueueRows = [];
			for (let i=0, l=calculationQueueItems.length; i<l; i++) {
				const item = calculationQueueItems[i];
				const key = item.route + '~' + item.minute;
				const calculationCount = calculationCounts[key] || 0;
				const score = highestCount - calculationCount;
				// Todo: boost score of newer routes
				calculationQueueRows.push({
					route: item.route,
					time: item.minute,
					priority: score
				});
			}

			calculationQueueRows.sort((a, b) => {
				return b.priority - a.priority;
			});

			let selectedRequestsCount = 0;
			let query = 'insert into "CalculationQueueItem" (route, time, priority, steps, selected) values ';
			const queryRows = [];
			const parameters = [];
			for (let i=0, l=calculationQueueRows.length; i<l; i++) {
				const row = calculationQueueRows[i];
				queryRows.push(`($${((i*5)+1)}, $${((i*5)+2)}, $${((i*5)+3)}, $${((i*5)+4)}, $${((i*5)+5)})`);

				parameters.push(row.route);

				parameters.push(row.time);

				parameters.push(row.priority);

				const routeStepCount = (row.time < '12:00:00' ? stepCounts[row.route].office : stepCounts[row.route].home);
				parameters.push(routeStepCount);

				selectedRequestsCount += routeStepCount;
				const isSelected = (selectedRequestsCount < GOOGLE_DAILY_QUOTA ? 'TRUE' : 'FALSE');
				parameters.push(isSelected);
			}
			query += queryRows.join(',\n') + ';';

			db.rawQuery('delete from "CalculationQueueItem"').then(() => {

				db.rawQuery(query, parameters).then((result) => {
					console.log('Success!');
				}).catch(console.error);

			}).catch(console.error);

		}).catch(console.error);

	}).catch(console.error);
};

const getMinutesInCommuteWindows = () => {
	const minutes = [];
	let timeOfDay = utils.morningStart.clone();
	while (timeOfDay.isBefore(utils.morningEnd)) {
		minutes.push(timeOfDay.format('HH:mm:00'));
		timeOfDay.add(1, 'minutes');
	}
	timeOfDay = utils.eveningStart.clone();
	while (timeOfDay.isBefore(utils.eveningEnd)) {
		minutes.push(timeOfDay.format('HH:mm:00'));
		timeOfDay.add(1, 'minutes');
	}
	return minutes;
};

const getRoutesAndStepCounts = () => {
	const sql = `
		select r.id, bt."destinationType", count(bs.id) from "Route" r
		join "BaseTrip" bt on bt.route = r.id
		join "BaseStep" bs on bs.trip = bt.id
		group by r.id, bt."destinationType"
	`;

	return db.rawQuery(sql, []);
};

const getCalculationCountsbyRouteAndTime = () => {
	const sql = `
		select timeresults, count(*) from (
			select "Route".id, "time"(date_trunc('minute', "time")) as time 
			from "Trip" 
			left join "Route" on "Trip".route = "Route".id 
			order by time
		) as timeresults 
		group by timeresults 
		order by count desc
	`;

	return db.rawQuery(sql, []);
};

module.exports = ranker;
