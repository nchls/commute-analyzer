import React from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

class IndexView extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			routes: []
		};
	}

	componentDidMount() {
		axios.get(`/api/routes`).then(function(response) {
			if (response.data !== undefined) {
				this.setState({routes: response.data});
			}
		}.bind(this));
	}

	render() {
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
}

export default IndexView;
