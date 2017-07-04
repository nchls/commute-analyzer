import React from 'react';
import axios from 'axios';
import moment from 'moment-timezone';

module.exports = React.createClass({
	getInitialState: function() {
		return {
			trips: []
		};
	},

	componentWillMount: function() {
		axios.get(`/api/route/${this.props.params.slug}`).then(function(response) {
			this.setState({trips: response.data});
		}.bind(this));
	},

	getMaxDuration: function() {
		let maxDuration = 0;
		this.state.trips.forEach((trip) => {
			const totalDuration = trip.durations.reduce((prev, curr) => prev + curr);
			if (totalDuration > maxDuration) {
				maxDuration = totalDuration;
			}
		});
		return maxDuration;
	},

	render: function() {
		const self = this;

		const maxDuration = self.getMaxDuration();

		return <div className="routeView">
			Trips
			<ol className="trips">
				{ self.state.trips.map(function(trip) {
					var momentInstance = moment(trip.time.substr(0,19)).tz('America/New_York');
					var tripDuration = trip.durations.reduce((prev, curr) => prev + curr);
					return <li key={trip.time} className="trip">
						<ol className="steps">
							{ trip.durations.map(function(step, index) {
								return <li 
									key={index}
									title={momentInstance.format('dddd, MMMM Do YYYY, h:mm a')}
									data-duration={step + ' seconds'}
									className="step"
									style={{
										width: ((step * 100) / tripDuration) * (tripDuration / maxDuration) + '%'
									}}>
								</li>;
							}) }
						</ol>
					</li>;
				}) }
			</ol>
		</div>;
	}
});
