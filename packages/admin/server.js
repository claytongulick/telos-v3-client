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
let ClusterServer = require('./server/classes/cluster-server');

let server = new ClusterServer();
server.start();