export const Route = () {
	return {
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
		}
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
	};
};

export const RouteInstance = () {
	return {
		route: {
			type: 'varchar',
			foreignModel: 'Route'
		},
		duration: {
			type: 'smallint'
		}
	};
};
