/*
 *   Copyright (c) 2020 Ratio Software, LLC 
 *   All rights reserved.
 *   @author Clayton Gulick <clay@ratiosoftware.com>
 */
let path = require('path');
let package_json = require('./package.json');
let {CleanWebpackPlugin} = require('clean-webpack-plugin');
let HtmlWebpackPlugin = require('html-webpack-plugin');
let CopyWebpackPlugin = require('copy-webpack-plugin');
//const {GenerateSW} = require('workbox-webpack-plugin');

let webpack = require('webpack');
let CLIENT_ID = process.env.CLIENT_ID || 'local';

let public_path = path.resolve(__dirname, 'dist');
let NODE_ENV = process.env.NODE_ENV; 
if(!NODE_ENV)
    NODE_ENV = 'local';

let webpack_config = {
    entry: {
        app: './app.js', 
    },
    mode: "development",
    context: path.resolve(__dirname,'ui'),
    output: {
        path: public_path,
        chunkFilename: 'chunks/[id].js',
        filename: '[name].js',
        publicPath: "/"
    },
    devtool: 'inline-source-map',
    plugins: [
        new webpack.DefinePlugin({
            NODE_ENV: JSON.stringify(NODE_ENV),
            CLIENT_ID: JSON.stringify(CLIENT_ID),
            APP_NAME: JSON.stringify(package_json.name),
            VERSION: JSON.stringify(package_json.version),
        }),
        //new CleanWebpackPlugin(),
        new HtmlWebpackPlugin(
            {
                title: "Telos Admin",
                template: path.resolve(__dirname,'templates/app', 'index.hbs'),
                filename: 'index.html',
                chunks: ['app']
            }),
        new CopyWebpackPlugin({
            patterns: 
                [
                    /*{
                        from: path.resolve(__dirname, 'public'),
                        to: path.resolve(__dirname, 'dist'),
                        force: true
                    },*/
                    {
                        from: path.resolve(__dirname, 'node_modules/@ionic/core/dist/ionic/svg'),
                        to: path.resolve(__dirname, 'dist/svg')
                    },
                ],
            }
        ),
        /*
        //SW for app
        new GenerateSW({
            swDest: '/sw/',
            exclude: [
                'admin/',
                'shoelace/',
                'taco/',
                'app/svg/',
                'new/',
                'fonts/',
                'assets/npi.json',
                'assets/practitioner_locations.json',
                'node_modules',
                'vendors-node_modules',
                'robots.txt',
                'readme.md',
                'site.webmanifest',
                '.DS_Store'
                ],
            //exclude: [/admin/
            // these options encourage the ServiceWorkers to get in there fast
            // and not allow any straggling "old" SWs to hang around
            clientsClaim: true,
            skipWaiting: true,
            maximumFileSizeToCacheInBytes: (25 * 1024 * 1024) //25meg limit
            //include: ['/assets/medications.json']
            //precacheManifestFilename: ''
        }),
        */
    ],
    module: {
        rules: [
            {
                test: /\.css$/,
                use: ['style-loader', 'css-loader']
            },
            {
                test: /\.(png|svg|jpg|gif|eot|ttf|woff|woff2)$/,
                use: [
                    {
                        loader: 'file-loader',
                        options: {
                            name: '[path][name].[ext]'
                        }
                    }
                ]
            },
            {
                test: /\.hbs$/,
                loader: "handlebars-loader"
            }

        ]
    }
};

module.exports = webpack_config;