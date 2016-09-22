import React from 'react';
import axios from 'axios';

module.exports = React.createClass({
	getInitialState: function() {
		return {
			routes: []
		};
	},

	componentWillMount: function() {
		axios.get(`/commute-api/routes`).then(function(response) {
			this.setState({routes: response.data});
		}.bind(this));
	},

	render: function() {
		const self = this;
		return (
			<ol>
				{this.state.routes.map(function(route) {
					return (
						<li>
							<a href={`/route/${route.slug}`}>{route.name}</a>
						</li>
					);
				}) }
			</ol>
		);
	}
});
