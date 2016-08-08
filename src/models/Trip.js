module.exports = (function() {
	return {
		name: 'Trip',
		schema: {
			route: {
				type: 'integer',
				foreignModel: 'Route'
			},
			time: {
				type: 'timestamp',
				default: 'now'
			}
		}
	};
}());
