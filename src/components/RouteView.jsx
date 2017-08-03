import React from 'react';
import axios from 'axios';
import moment from 'moment-timezone';
import classNames from 'classnames';

class RouteView extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			trips: []
		};
	}
	
	componentDidMount() {
		axios.get(`/api/route/${this.props.match.params.slug}`).then(function(response) {
			this.setState({trips: response.data});
		}.bind(this));
	}

	getMaxDuration() {
		let maxDuration = 0;
		this.state.trips.forEach((trip) => {
			const totalDuration = trip.durations.reduce((prev, curr) => prev + curr);
			if (totalDuration > maxDuration) {
				maxDuration = totalDuration;
			}
		});
		return maxDuration;
	}

	render() {
		const self = this;

		const maxDuration = self.getMaxDuration();

		return <div className="routeView">
			Trips
			<ol className="trips">
				{ self.state.trips.map(function(trip) {
					var momentInstance = moment(trip.time, 'HH:mm:ss');
					var tripDuration = trip.durations.reduce((prev, curr) => prev + curr);
					return <li 
						key={trip.time} 
						className={ classNames(
							'trip', 
							{ actual: trip.isActual }
						) }
						title={momentInstance.format('dddd, MMMM Do YYYY, h:mm a')}
					>
						<ol className="steps">
							{ trip.durations.map(function(step, index) {
								return <li 
									key={index}
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
}

export default RouteView;
