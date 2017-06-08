module.exports = (function() {
	return {
		name: 'CalculationQueueItem',
		schema: {
			baseStep: {
				type: 'integer',
				foreignModel: 'BaseStep'
			},
			time: {
				type: 'time with time zone'
			},
			priority: {
				type: 'integer'
			}
		}
	};
}());
