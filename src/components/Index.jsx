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
		axios.get(`/api/routes`).then(function(response) {
			if (response.data !== undefined) {
				this.setState({routes: response.data});
			}
		}.bind(this));
	},

	render: function() {
		const self = this;
		return (
			<ol>
				{self.state.routes.map((route) => {
					return (
						<li key={route.slug}>
							<Link to={`/route/${route.slug}`}>{route.name}</Link>
						</li>
					);
				}) }
			</ol>
		);
	}
});
