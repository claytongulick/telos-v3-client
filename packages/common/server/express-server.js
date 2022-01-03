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
let express = require('express');
const morgan = require('morgan');
const bodyParser = require('body-parser');
const compression = require('compression');
const helmet = require('helmet');
const methodOverride = require('method-override');
const path = require('path');
const session = require('express-session');
//const pg_store = require('connect-pg-simple')(session);
// initalize sequelize with session store
let SequelizeStore = require("connect-session-sequelize")(session.Store);
let session_db = require('common/db/sequelize').get('session');
//This is needed, even though Session isn't used in order to register the model with Sequelize
let Session = require('common/db/models/session');
const program = require('commander');
const rfs = require('rotating-file-stream');

const { ErrorLog } = require('../db/models');

/**
 * @typedef {Object} WebLogsConfig Settings for standard web access logging GET, POST, etc...
 * @property {string} file_name The file name to use for weblogs. Should be the application name in most cases.
 * @property {string} type type is an option from https://www.npmjs.com/package/morgan
 * @property {string} path The location log files should be saved to. Must be app user writable (run_as uid)
 * @property {string} interval The log rotation interval
 * 
 * @typedef {Object} ExpressConfig
 * @property {Object} package_json The package.json for the application
 * @property {string} mount_path The path the app should be mounted on. '/' will be used if not provided.
 * @property {boolean} force_ssl Should non-ssl requests be redirected to ssl port?
 * @property {boolean} enable_compression Whether the server should compress results
 * @property {number} compression_level How much compression should be used
 * @property {string | Array} statics_dir The director(ies) static files should be served from
 * @property {boolean} is_proxied Indicates whether the application is running behind a proxy
 * @property {WebLogsConfig} web_logs Web logs configuration
 * 
 * 
 * @param {*} logger 
 * @param {ExpressConfig} config 
 * @returns 
 */
module.exports = function (logger, routers, config, middleware) {
    program
        .option('-a, --auth <username>', 'Force all requests that come in to the express server to be authenticated as the specified user. This can only be used in local and development environments.');
    program.parse();
    let options = program.opts();
    if (options.auth)
        logger.warn("Forcing authentication to:" + options.auth);

    // Initialize express app
    let app = express();
    app.set('logger', logger);

    //are we running behind a proxy?
    if(config.is_proxied)
        app.set('trust proxy', 1);

    // Use helmet to secure Express headers
    app.use(helmet.frameguard('sameorigin'));
    /*
    app.use(helmet.contentSecurityPolicy({
        useDefaults: true
    }));
    */
    app.use(helmet.dnsPrefetchControl());
    app.use(helmet.expectCt());
    app.use(helmet.hidePoweredBy());
    if (config.force_ssl)
        app.use(helmet.hsts());
    app.use(helmet.ieNoOpen());
    app.use(helmet.noSniff());
    app.use(helmet.permittedCrossDomainPolicies());
    app.use(helmet.referrerPolicy());
    app.use(helmet.xssFilter());

    // Request body parsing middleware should be above methodOverride
    app.use(bodyParser.json({ limit: '10mb' }));
    app.use(bodyParser.urlencoded({
        extended: true,
        limit: '10mb'
    }));

    // Should be placed before express.static
    app.use(compression());

    //configure statics
    if (typeof config.statics_dir == 'string')
        //e-tags are calculated at request time, the whole file is read. We'll use last-modified for caching
        app.use(config.mount_path, express.static(config.statics_dir, { etag: false }));
    else if (Array.isArray(config.statics_dir) && config.statics_dir.length > 1)
        config.statics_dir.forEach(
            function (dir) {
                app.use(config.mount_path, express.static(path.resolve(dir), { etag: false }));
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
        try {
            //determine the cookie host
            //the cookie should be set on the root domain
            /** @type {string} */
            let request_host = req.headers.host;
            let cookie_host_domain;
            //for local development
            if (request_host.startsWith('localhost')) {
                cookie_host_domain = 'localhost';
            }
            else {
                //for belt and suspenders, only allow domains we know about
                let root_domain = request_host.split('.').slice(-2).join('.');
                if (process.env.HOSTNAME == root_domain)
                    cookie_host_domain = root_domain;
                if (process.env.WHITELABEL_HOSTNAME == root_domain)
                    cookie_host_domain = root_domain;
            }

            let session_options = {
                secret: process.env.CLIENT_SECRET,
                name: 'telos.sid',
                saveUninitialized: false,
                resave: false,
                cookie: {
                    httpOnly: true,
                    secure: !(process.env.NODE_ENV === 'local'),
                    sameSite: 'strict',
                    domain: cookie_host_domain,
                    proxy: config.is_proxied,
                    maxAge: process.env.SESSION_MAX_AGE || (1000 * 60 * 20) //default to 20 mins if not set
                }
            }

            session_options.store = new SequelizeStore({
                db: session_db,
                table: 'Session',
                extendDefaultFields: (defaults, session) => {
                    return {
                        data: defaults.data,
                        expires: defaults.expires,
                        user_id: session?.user?.id,
                        client_id: process.env.CLIENT_ID
                      };
                }
            });

            let dynamic_session = session(session_options);
            dynamic_session(req, res, next);
        }
        catch (err) {
            next(err);
        }
    });

    //if the server was launched with an override-authentication parameter, force auth as the specified user
    //this is used for debugging and development purposes only
    app.use(async (req, res, next) => {
        try {

            //only allow this option in local or development environments
            if (!(['local', 'development'].includes(process.env.NODE_ENV))) {
                return next();
            }

            let username = options.auth;
            if (!username)
                return next();

            if (req?.session?.user?.username == username)
                return next(); //we already have an authenticated session

            let User = require('common/db/models/user');
            let user = await User.findOne({ where: { username } });
            if (!user)
                return next('Invalid or unknown auth username: ' + username);
            /** @type {AuthSession} */
            let auth_session = {
                client_id: 'local',
                flow: 'password',
                session_start_date: new Date(),
                session_trusted_date: new Date(),
                status: 'complete',
                trusted: true,
                user: user
            };
            Object.assign(req.session, auth_session);
            next();
        }
        catch (err) {
            next(err);
        }
    });

    //allow the use of modern http verbs for older clients that might not support them (PUT, etc...)
    app.use(methodOverride());

    //let each route file set up its routes the way it wants
    for (let router of routers) {
        //hoist the configured routes onto the mount path
        app.use(router.__telos_mount_path || config.mount_path || '/', router);
    }

    //register any additional middleware the server wants
    if (middleware && Array.isArray(middleware)) {
        for (let m of middleware)
            app.use(m)
    }

    //logging error handler
    app.use(async (err, req, res, next) => {
        logger.error(err.stack);
        try {
            await ErrorLog.create({
                error_type: err.name,
                code: err.code,
                message: err.message,
                stack_trace: err.stack,
                application: config?.package_json?.name,
                reference_id: err.reference_id,
                severity: err.severity || 0,
            });
        }
        catch (err) {
            logger.error("Failed to save error log: " + err.stack);
        }
        next(err);
    });

    //send json error
    app.use((err, req, res, next) => {
        res.status(500).send({ error: err.stack });
    });

    return app;
}
