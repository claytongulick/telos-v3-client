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
let ExpressServer = require('common/server/express-server');
let http_proxy = require('http-proxy');
let proxy = http_proxy.createProxyServer({});
let sites = require('./sites');

let proxy_middleware = async (req, res, next) => {
    //set the proxy object on the request so that it's available to all the site proxies
    req.proxy = proxy;
    try {
        for(let site of sites) {
            if(site.test(req)) {
                await site.handle(req, res);
                next();
            }
        }
    }
    catch(err) {
        return next(err);
    }
} 

let app = ExpressServer(logger, routes, config.express, [proxy_middleware]);
let ClusterServer = require('common/server/cluster-server');

let server = new ClusterServer(app, logger, config.cluster);
server.start();