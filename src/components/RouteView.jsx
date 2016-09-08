import React from 'react';
import axios from 'axios';

module.exports = React.createClass({
	componentWillMount: function() {
		axios.get(`/commute-api/${'pownal'}`).then(function(response) {
			console.log(response);
		});
	},
	render: function() {
		return <div>
			Route view {this.props.slug}
		</div>;
	}
});
