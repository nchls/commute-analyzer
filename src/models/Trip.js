module.exports = (function() {
	return {
		name: 'Trip',
		schema: {
			route: {
				type: 'integer',
				foreignModel: 'Route'
			},
			time: {
				type: 'timestamp with time zone',
				default: 'now'
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
