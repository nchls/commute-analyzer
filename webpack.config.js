var path = require('path');
var webpack = require('webpack');
var webpackDevServer = require('webpack-dev-server');
var htmlPlugin = require('html-webpack-plugin');

module.exports = {
	context: path.join(__dirname, 'src'),
	entry: path.join(__dirname, 'src', 'app.js'),
	output: {
		path: path.join(__dirname, 'dist'),
		filename: '/bundle.js'
	},
	plugins: [
		new htmlPlugin({
			template: 'app.html',
		})
	],
	devServer: {
		proxy: {
			'/commute-api/*': {
				target: 'http://127.0.0.1:8081',
				secure: false
			}
		}
	},
	devtool: 'sourcemap',
	module: {
		loaders: [
			{
				test: /\.jsx?$/,
				exclude: /node_modules/,
				loader: 'babel-loader'
			}
		]
	}
};
