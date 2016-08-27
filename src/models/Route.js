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
			home: {
				type: 'varchar',
				validation: {
					maxLength: 200
				}
			},
			office: {
				type: 'varchar',
				validation: {
					maxLength: 200
				}
			}
		}
	};
}());
