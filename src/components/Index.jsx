import React from 'react';
import axios from 'axios';
import { Link } from 'react-router';

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
						<li key={route.slug}>
							<Link to={`/commute/route/${route.slug}`}>{route.name}</Link>
						</li>
					);
				}) }
			</ol>
		);
	}
});
