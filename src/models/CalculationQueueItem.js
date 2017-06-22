module.exports = (function() {
	return {
		name: 'CalculationQueueItem',
		schema: {
			route: {
				type: 'integer',
				foreignModel: 'Route'
			},
			steps: {
				type: 'smallint'
			},
			time: {
				type: 'time with time zone'
			},
			priority: {
				type: 'integer'
			},
			selected: {
				type: 'boolean'
			}
		}
	};
}());
