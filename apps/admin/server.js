/**
 server.js

 Starting point for launching server.

 @author Clay Gulick
 @email clay@ratiosoftware.com
**/
//require('newrelic');
let ClusterServer = require('./server/classes/cluster-server');

let server = new ClusterServer();
server.start();