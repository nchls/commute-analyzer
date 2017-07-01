import React from 'react';
import ReactDOM from 'react-dom';
import { 
	Router, 
	Route, 
	IndexRoute, 
	browserHistory 
} from 'react-router';

import App from './components/App.jsx';
import Index from './components/Index.jsx';
import RouteView from './components/RouteView.jsx';

ReactDOM.render((
	<Router history={browserHistory}>
		<Route path="/commute/" component={App}>
			<IndexRoute component={Index}/>
			<Route path="route/:slug" component={RouteView}/>
		</Route>
	</Router>
), document.getElementById('app'));
