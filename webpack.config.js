const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');

module.exports = {
	entry: './src/index.ts',
	output: {
		filename: 'main.js',
		path: path.resolve(__dirname, 'dist'),
	},
	module: {
		rules: [
			{
				test: /\.worker.ts$/,
				use: [
					'worker-loader',
					'ts-loader'
				],
				exclude: /node_modules/,
			},
			{
				test: /\.ts$/,
				use: 'ts-loader',
				exclude: /node_modules/,
			},
		],
	},
	devtool: 'eval-source-map',
	plugins: [
		new CleanWebpackPlugin(),
		new HtmlWebpackPlugin()
	],
	resolve: {
		extensions: ['.js', '.ts'],
	},
};
