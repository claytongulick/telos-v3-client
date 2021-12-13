/**
 * express-server.js
 *
 * Utility to configure and launch express server
 *
 * @author Clay Gulick
 * @email clay@ratiosoftware.com
 *
 */

/**
 * Module dependencies.
 */
let express = require('express'),
    morgan = require('morgan'),
    helmet = require('helmet'),
    methodOverride = require('method-override'),
    path = require('path'),
    redis = require('redis');
    session = require('express-session');
    RedisStore = require('connect-redis')(session);
    rfs = require('rotating-file-stream');

let http_proxy = require('http-proxy');
let proxy = http_proxy.createProxyServer({});

/**
 * @typedef {Object} WebLogsConfig Settings for standard web access logging GET, POST, etc...
 * @property {string} file_name The file name to use for weblogs. Should be the application name in most cases.
 * @property {string} type type is an option from https://www.npmjs.com/package/morgan
 * @property {string} path The location log files should be saved to. Must be app user writable (run_as uid)
 * @property {string} interval The log rotation interval
 * 
 * @typedef {Object} ExpressConfig
 * @property {string} mount_path The path the app should be mounted on. '/' will be used if not provided.
 * @property {boolean} force_ssl Should non-ssl requests be redirected to ssl port?
 * @property {boolean} enable_compression Whether the server should compress results
 * @property {number} compression_level How much compression should be used
 * @property {string | Array} statics_dir The director(ies) static files should be served from
 * @property {WebLogsConfig} web_logs Web logs configuration
 * 
 * @param {*} logger 
 * @param {ExpressConfig} config 
 * @returns 
 */
module.exports = function (logger, routes, config, middleware) {

    // Initialize express app
    let app = express();
    app.set('logger', logger);
    app.set('trust proxy', true);

    // Use helmet to secure Express headers
    app.use(helmet.frameguard('sameorigin'));
    app.use(helmet.contentSecurityPolicy({
        useDefaults: true
    }));
    app.use(helmet.dnsPrefetchControl());
    app.use(helmet.expectCt());
    app.use(helmet.hidePoweredBy());
    app.use(helmet.hsts());
    app.use(helmet.ieNoOpen());
    app.use(helmet.noSniff());
    app.use(helmet.permittedCrossDomainPolicies());
    app.use(helmet.referrerPolicy());
    app.use(helmet.xssFilter());

    //configure statics
    if (typeof config.statics_dir == 'string')
        //e-tags are calculated at request time, the whole file is read. We'll use last-modified for caching
        app.use(express.static(path.resolve(config.statics_dir), { etag: false }));
    else if (Array.isArray(config.statics_dir) && config.statics_dir.length > 1)
        config.statics_dir.forEach(
            function (dir) {
                app.use(express.static(path.resolve(dir), { etag: false }));
            }
        );

    //set up http request logging
    if (['development', 'qa', 'production'].includes(process.env.NODE_ENV)) {
        var accessLogStream = rfs(config.web_logs.file_name, {
            interval: config.web_logs.rotation_interval,
            path: config.web_logs.path
        });
        app.use(morgan(config.web_logs.type, { stream: accessLogStream }));
    }
    else {
        app.use(morgan(config.web_logs.type));
    }

    //make json output pretty
    app.set('json spaces', 2);

    //disable any sort of view caching
    app.set('view cache', false);

    //set up dynamic session based on the hostname that came into this IP. 
    //this is to support *.teloshs.com as well as whitelabeled domains
    app.use((req, res, next) => {
        //determine the cookie host
        //the cookie should be set on the root domain
        /** @type {string} */
        let request_host = req.headers.host;
        let cookie_host_domain;
        //for local development
        if(request_host == 'localhost') {
            cookie_host_domain = 'localhost';
        }
        else {
            //for belt and suspenders, only allow domains we know about
            let root_domain = request_host.split('.').slice(-2).join('.');
            if(process.env.HOSTNAME == root_domain)
                cookie_host_domain = root_domain;
            if(process.env.WHITELABEL_HOSTNAME == root_domain)
                cookie_host_domain = root_domain;
        }

        let session_options = {
            secret: process.env.CLIENT_SECRET,
            name: 'telos.sid',
            saveUninitialized: false,
            cookie: {
                httpOnly: true,
                secure: true,
                sameSite: 'strict',
                domain: cookie_host_domain,
                maxAge: process.env.SESSION_MAX_AGE || (1000 * 60 * 20) //default to 20 mins if not set
            }
        }

        if(process.env.ENABLE_REDIS_SESSION) {
            let redis_client = redis.createClient({
                host: process.env.REDIS_HOST
            });
            session_options.store = new RedisStore({client: redis_client});
        }

        let dynamic_session = session(session_options);
        dynamic_session(req, res, next);
    });

    //allow the use of modern http verbs for older clients that might not support them (PUT, etc...)
    app.use(methodOverride());

    let router = express.Router();
    //let each route file set up its routes the way it wants
    for(let route of routes) {
        route(router)
    }
    //hoist the configured routes onto the mount path
    app.use(config.mount_path || '/', router);

    //register any additional middleware the server wants
    if(middleware && Array.isArray(middleware)) {
        for(let m of middleware)
            app.use(m)
    }

    //logging error handler
    app.use((err, req, res, next) => {
        logger.error(err.stack);
        next(err);
    });

    //send json error
    app.use((err, req, res, next) => {
        res.status(500).send({ error: err.stack });
    });

    return app;
}
