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
		axios.get(`/commute-api/${'pownal'}`).then(function(response) {
			this.setState({trips: response.data});
		}.bind(this));
	},

	render: function() {
		const self = this;
		return <div>
			Trips
			{ self.state.trips.map(function(trip) {
				var momentInstance = moment(trip.time).tz('America/New_York');
				return <div key={trip.time} className="trip">
					{ trip.durations.map(function(step, index) {
						return <div 
							key={index}
							title={momentInstance.format('dddd, MMMM Do YYYY, h:mm a')}
							className="step"
							style={{
								width: (step / 3) + 'px'
							}}>
						</div>;
					}) }
				</div>;
			}) }
		</div>;
	}
});
