import React from 'react';
import ReactDOM from 'react-dom';
import { 
	Router, 
	Route, 
	IndexRedirect,
	IndexRoute, 
	browserHistory 
} from 'react-router';

import App from './components/App.jsx';
import Index from './components/Index.jsx';
import RouteView from './components/RouteView.jsx';

ReactDOM.render((
	<Router history={browserHistory}>
		<Route path="/" component={App}>
			<IndexRedirect to="commute"/>
			<Route path="commute">
				<IndexRoute component={Index}/>
				<Route path="route/:slug" component={RouteView}/>
			</Route>
		</Route>
	</Router>
), document.getElementById('app'));
