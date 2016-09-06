module.exports = (function() {
	return {
		name: 'BaseStep',
		schema: {
			trip: {
				type: 'integer',
				foreignModel: 'BaseTrip'
			},
			index: {
				type: 'smallint'
			},
			startLat: {
				type: 'double precision'
			},
			startLon: {
				type: 'double precision'
			},
			endLat: {
				type: 'double precision'
			},
			endLon: {
				type: 'double precision'
			}
		}
	};
}());
