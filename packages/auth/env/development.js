/*
 *   Copyright (c) 2020 Ratio Software, LLC 
 *   All rights reserved.
 *   @author Clayton Gulick <clay@ratiosoftware.com>
 */
'use strict';

/**
 * development.js
 *
 * Development environment config file. Setting specific to running on a dev server
 */
let config = {
    port: 80,
    posix_info: {
        uid: 'app',
        gid: 'app'
    },
    ssl: {
        enable: true,
        force: true,
        port: 443,
        options: {
            key: '/etc/letsencrypt/live/kithandkin.ratiosoftware.com/privkey.pem',
            cert: '/etc/letsencrypt/live/kithandkin.ratiosoftware.com/cert.pem',
            ca: '/etc/letsencrypt/live/kithandkin.ratiosoftware.com/chain.pem'
        }
    },
    log_level: 'debug',
    //web request logging config
    web_logs: {
        type: 'file', //log requests to console. Valid options are 'console' or 'file'
        type: 'combined', //apache 'combine' format
        path: '/home/app/logs', //if type is 'file' the folder to store log rotation
        rotation_interval: '1d' //rotate daily
    },
    base_url: 'https://kithandkin.ratiosoftware.com',

};

module.exports = config;
