/**
 server.js

 Starting point for launching server.

 @author Clay Gulick
 @email clay@ratiosoftware.com
**/
//require('newrelic');
let dotenv = require('dotenv');
dotenv.config({
    path: '../../.env'
});
let config = require('./config/config');
let logger = require('common/server/logging').getLogger(config.logging);
let routes = require('./server/routes');
//we don't use the common express server for the proxy server
let ExpressServer = require('./server/classes/express-server');
let app = ExpressServer(logger, routes, config.express);
let ClusterServer = require('common/server/cluster-server');

let server = new ClusterServer(app, logger, config.cluster);
server.start();