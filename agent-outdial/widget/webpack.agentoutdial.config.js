const path = require('path');

module.exports = {
	entry: {
		agentoutdial: './src/index.agentoutdial.js',
	},
	output: {
		path: path.resolve('../src/main/resources/static/widget', 'outdial'),
		filename: '[name]-bundle.js'
	},
	resolve: {
		modules: [
			path.join(__dirname, 'src'), 'node_modules'
		]
	},
	module: {
		rules: [
			{
				test: /\.(js|jsx)$/,
				exclude: /node_modules/,
				use: {
					loader: 'babel-loader',
				},
			}
		],
	}
};