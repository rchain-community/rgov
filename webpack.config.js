/* global require, module, process, __dirname */
const path = require('path');
const HTMLWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  mode: process.env.NODE_ENV,
  devtool: 'inline-source-map',
  devServer: {
    contentBase: './src',
    hot: true,
  },
  entry: './src/index.js',
  module: {
    rules: [
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader'],
      },
    ],
  },
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'dist'),
  },
  node: {
    // Buffer: true,
  },
  plugins: [
    new HTMLWebpackPlugin({
      template: './src/participate.html',
      filename: 'index.html',
    }),
  ],
};
