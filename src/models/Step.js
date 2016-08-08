module.exports = (function() {
	return {
		name: 'Step',
		schema: {
			trip: {
				type: 'integer',
				foreignModel: 'Trip'
			},
			index: {
				type: 'smallint'
			},
			duration: {
				type: 'integer'
			}
		}
	};
}());
