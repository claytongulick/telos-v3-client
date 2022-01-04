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
let logger = require('common/server/logging').getLogger(config.logging);
let router = require('./server/routes');
//we don't use the common express server for the proxy server
let ExpressServer = require('common/server/express-server');
let http_proxy = require('http-proxy');
let proxy = http_proxy.createProxyServer({});
proxy.on('proxyReq', (proxyReq, req, res, options) => {
    console.debug(`proxying ${req.headers.host}${req.url} to ${proxyReq.host}${proxyReq.path}`)
});
proxy.on('proxyRes', (proxyRes, req, res) => {
    console.debug(`proxy response code: ${proxyRes.statusCode} ${proxyRes.statusMessage}`)
});
proxy.on('error', (err, req, res, target) => {
    console.error(err);
    res.status(500).send({status: 'error', message: JSON.stringify(err)});
});
let sites = require('./server/sites');

let proxy_middleware = async (req, res, next) => {
    //set the proxy object on the request so that it's available to all the site proxies
    req.proxy = proxy;
    let handled = false;
    try {
        for(let site of sites) {
            if(site.test(req)) {
                handled = true;
                await site.handle(req, res);
                break;
            }
        }
        if(!handled)
            next();
    }
    catch(err) {
        return next(err);
    }
} 

let app = ExpressServer(logger, [router], config.express, [proxy_middleware]);
let ClusterServer = require('common/server/cluster-server');

let server = new ClusterServer(app, logger, config.cluster);
server.start();