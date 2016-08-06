export const Step = () {
	return {
		routeInstance: {
			type: 'varchar',
			foreignModel: 'RouteInstance'
		},
		index: {
			type: 'smallint'
		},
		duration: {
			type: 'smallint'
		}
	};
};
