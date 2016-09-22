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
				target: 'http://127.0.0.1:29090',
				pathRewrite: function(path, req) {
					console.log('path', path);
					return path.replace('/commute-api', '');
				}
			}
		}
	},
	devtool: 'sourcemap',
	module: {
		loaders: [
			{
				test: /\.json$/, 
				loader: 'json-loader'
			},
			{
				test: /\.jsx?$/,
				exclude: /node_modules/,
				loader: 'babel-loader'
			}
		]
	}
};
