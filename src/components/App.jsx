import React from 'react';

module.exports = React.createClass({
	componentWillMount: function() {

	},
	render: function() {
		return <div>
			<h1>Commute Analyzer</h1>
			<div>
				{this.props.children}
			</div>
		</div>;
	}
});