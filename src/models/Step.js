module.exports = (function() {
	return {
		name: 'Step',
		schema: {
			trip: {
				type: 'integer',
				foreignModel: 'Trip'
			},
			duration: {
				type: 'integer'
			},
			baseStep: {
				type: 'integer',
				foreignModel: 'BaseStep'
			}
		}
	};
}());
