import React from 'react';
import { Route } from 'react-router-dom';

import IndexView from './IndexView.jsx';
import RouteView from './RouteView.jsx';

class App extends React.Component {
	render() {
		return <div>
			<h1>Commute Analyzer</h1>
			<div>
				<Route exact path="/" component={ IndexView }/>
				<Route path="/route/:slug" component={ RouteView }/>
			</div>
		</div>;
	}
}

export default App;
