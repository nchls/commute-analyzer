module.exports = (function() {
	return {
		name: 'Route',
		schema: {
			name: {
				type: 'varchar',
				validation: {
					maxLength: 80
				}
			},
			slug: {
				type: 'varchar',
				validation: {
					maxLength: 40
				}
			},
			origin: {
				type: 'varchar',
				validation: {
					maxLength: 200
				}
			},
			destination: {
				type: 'varchar',
				validation: {
					maxLength: 200
				}
			}
		}
	};
}());
