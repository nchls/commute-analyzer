var path = require('path');
var webpack = require('webpack');

module.exports = {
	context: path.join(__dirname, 'src'),
	entry: path.join(__dirname, 'src', 'app.js'),
	output: {
		path: path.join(__dirname, 'dist'),
		filename: 'bundle.js'
	},
	module: {
		rules: [
			{
				test: /\.jsx?$/,
				exclude: /node_modules/,
				loader: 'babel-loader'
			}
		]
	}
};
