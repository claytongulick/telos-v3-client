/*
 *   Copyright (c) 2020 Ratio Software, LLC 
 *   All rights reserved.
 *   @author Clayton Gulick <clay@ratiosoftware.com>
 */
'use strict';

/**
 * helper-express.js
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
var express = require('express'),
    morgan = require('morgan'),
    helmet = require('helmet'),
    methodOverride = require('method-override'),
    passport = require('passport'),
    path = require('path'),
    rfs = require('rotating-file-stream'),
    compression = require('compression');

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
module.exports = function (logger, routes, config) {

    // Initialize express app
    let app = express();
    app.set('logger', logger);
    app.set('trust proxy', true);

    // Use helmet to secure Express headers
    app.use(helmet.frameguard('sameorigin'));
    app.use(helmet.xssFilter());
    app.use(helmet.noSniff());
    app.use(helmet.ieNoOpen());
    app.disable('x-powered-by');

    //if forcing https, force redirect on http request
    app.use(function (req, res, next) {
        if (config.force_ssl)
            if (!req.secure)
                return res.redirect(['https://', req.get('Host'), req.url].join(''));

        next();
    });

    // Should be placed before express.static
    if(config.enable_compression)
        app.use(compression({level: config.compression_level || -1}));

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

    //add passport middleware
    app.use(passport.initialize());

    // Request body parsing middleware should be above methodOverride
    app.use(express.json({ limit: '10mb' }));
    app.use(express.urlencoded({
        extended: true,
        limit: '10mb'
    }));

    //allow the use of modern http verbs for older clients that might not support them (PUT, etc...)
    app.use(methodOverride());

    let router = express.Router();
    //let each route file set up its routes the way it wants
    for(let route of routes) {
        route(router)
    }

    //hoist the configured routes onto the mount path
    app.use(config.mount_path || '/', router);

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
