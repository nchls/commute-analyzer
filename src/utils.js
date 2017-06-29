var moment = require('moment-timezone');

var TIMEZONE = 'America/New_York';

var morningStart = moment().tz(TIMEZONE).set({
	hour: 5,
	minute: 0,
	second: 0,
	millisecond: 0
});
var morningEnd = moment().tz(TIMEZONE).set({
	hour: 9,
	minute: 30,
	second: 0,
	millisecond: 0
});
var eveningStart = moment().tz(TIMEZONE).set({
	hour: 3 + 12,
	minute: 0,
	second: 0,
	millisecond: 0
});
var eveningEnd = moment().tz(TIMEZONE).set({
	hour: 7 + 12,
	minute: 30,
	second: 0,
	millisecond: 0
});

module.exports = {
	TIMEZONE: TIMEZONE,
	morningStart: morningStart,
	morningEnd: morningEnd,
	eveningStart: eveningStart,
	eveningEnd: eveningEnd
};
