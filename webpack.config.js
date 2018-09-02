var path = require('path');
var webpack = require('webpack');
var htmlPlugin = require('html-webpack-plugin');

module.exports = {
	context: path.join(__dirname, 'src'),
	entry: path.join(__dirname, 'src', 'app.js'),
	output: {
		path: path.join(__dirname, 'dist'),
		publicPath: '/static/',
		filename: 'bundle.js'
	},
	plugins: [
		new htmlPlugin({
			template: 'app.html',
			filename: path.join(__dirname, 'dist', 'index.html')
		})
	],
	devtool: 'source-map',
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
