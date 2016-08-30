import React from 'react';

module.exports = React.createClass({
	componentWillMount: function() {

	},
	render: function() {
		return <div>
			Route view {this.props.slug}
		</div>;
	}
});
