/**
 server.js

 Starting point for launching server.

 @author Clay Gulick
 @email clay@ratiosoftware.com
**/
//require('newrelic');
let dotenv = require('dotenv');
let path = require('path');
dotenv.config({
    path: path.resolve(__dirname,'..','..','.env')
});
let config = require('./config/config');
let logger = require('common/server/logging').getLogger(config);
require('./server/classes/passport-utility').configurePassport();
let routes = require('./server/routes');
let ExpressServer = require('common/server/express-server')
let app = ExpressServer(logger, routes, config.express);
let ClusterServer = require('common/server/cluster-server');

let server = new ClusterServer(app, logger, config.cluster);
server.start();