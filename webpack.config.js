const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
	mode: 'development',
	entry: {
		app: './src/example/app.tsx',
	},
	devtool: 'inline-source-map',
	devServer: {
		port: 4000,
		host: '0.0.0.0',
		contentBase: './dist',
	},
	plugins: [
		new HtmlWebpackPlugin({
			title: 'example页面',
			template: './src/example/index.html',
		}),
	],
	module: {
		rules: [
			{
				test: /\.tsx?$/,
				use: 'ts-loader',
				exclude: /node_modules/,
			},
			{
				test: /\.css$/i,
				use: ['style-loader', 'css-loader'],
			},
			{
				test: /\.less$/i,
				use: [
					{
						loader: 'style-loader', // 从 JS 中创建样式节点
					},
					{
						loader: 'css-loader',
						options: {
							modules: true,
						}, // 转化 CSS 为 CommonJS
					},
					{
						loader: 'less-loader', // 编译 Less 为 CSS
					},
				],
			},
			{
				test: /\.(png|svg|jpg|jpeg|gif)$/i,
				type: 'asset/resource',
			},
			{
				test: /\.(woff|woff2|eot|ttf|otf)$/i,
				type: 'asset/resource',
			},
		],
	},
	resolve: {
		extensions: ['.tsx', '.ts', '.js'],
	},
	output: {
		filename: '[name].bundle.js',
		path: path.resolve(__dirname, 'dist'),
		clean: true,
	},
};
