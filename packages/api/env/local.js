/*
 *   Copyright (c) 2020 Ratio Software, LLC 
 *   All rights reserved.
 *   @author Clayton Gulick <clay@ratiosoftware.com>
 */
'use strict';
/**
 * local.js
 *
 * Local config file for running server on a development machine or laptop
 *
 */
let config = {
    port: 3000,
    ssl: {
        enable: false,
        port: 3443,
        /*options: {
            key: fs.readFileSync('/etc/letsencrypt/live/dev.jopl.net/privkey.pem'),
            cert: fs.readFileSync('/etc/letsencrypt/live/dev.jopl.net/cert.pem'),
            ca: fs.readFileSync('/etc/letsencrypt/live/dev.jopl.net/chain.pem')
        }*/
    },
    log_level: 'debug',
    //Should stackdriver be used as a winston logging transport
    enable_stackdriver_logging: false,
    web_logs: {
        type: 'console', //log requests to console. Valid options are 'console' or 'file'
        type: 'combined', //apache 'combine' format
        path: '.', //if type is 'file' the folder to store log rotation
        rotation_interval: '1d' //rotate daily
    },

    base_url: "http://localhost:3000"

};

module.exports = config;