const NodePolyfillPlugin = require("node-polyfill-webpack-plugin");
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const webpack = require("webpack");
const CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = {
    entry: {
        index: './src/index.js'
    },
    plugins: [
        new webpack.HotModuleReplacementPlugin(),
        new NodePolyfillPlugin(),
        new HtmlWebpackPlugin({
            title: 'Percept Widget',
            template: './public/index.html'
        }),
        new CopyWebpackPlugin({
            patterns: [{
                from: 'public/icons',
                to: 'icons'
            },{
                from: 'public/images',
                to: 'images'
            },{
                from: 'public/videos',
                to: 'videos'
            }]
        })
    ],
    devtool: 'inline-source-map',
    module: {
        rules: [
            {
                test: /\.css$/i,
                use: ['style-loader', 'css-loader'],
            },
            {
                test: /\.(js|jsx)$/,
                exclude: /(node_modules|bower_components)/,
                loader: "babel-loader",
                options: { presets: ["@babel/env"] }
            },
            {
                test: /\.tsx?$/,
                use: 'ts-loader',
                exclude: /node_modules/,
            },
            {
                test: /\.(png|svg|jpg|jpeg|gif)$/i,
                type: 'asset/resource',
            }
        ],
    },
    resolve: {
        extensions: ['*', '.tsx', '.ts', '.js', '.jsx'],
        fallback: {
            "fs": false,
            "child_process": false
        }
    },
    output: {
        path: path.resolve(__dirname, './build'),
        filename: '[name].bundle.js',
        clean: true,
    },
};