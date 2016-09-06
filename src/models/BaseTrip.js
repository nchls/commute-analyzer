module.exports = (function() {
	return {
		name: 'BaseTrip',
		schema: {
			route: {
				type: 'integer',
				foreignModel: 'Route'
			},
			destinationType: { // 'home' or 'office'
				type: 'varchar',
				validation: {
					maxLength: 10
				}
			}
		}
	};
}());
