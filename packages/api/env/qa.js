/*
 *   Copyright (c) 2020 Ratio Software, LLC 
 *   All rights reserved.
 *   @author Clayton Gulick <clay@ratiosoftware.com>
 */
'use strict';
/**
 * qa.js
 *
 * Configuration file for qa environment.
 *
 */
let config = {
    port: 80,
    ssl: {
        enable: true,
        port: 443,
        options: {
            key: fs.readFileSync('/etc/letsencrypt/live/qa.jopl.net/privkey.pem'),
            cert: fs.readFileSync('/etc/letsencrypt/live/qa.jopl.net/cert.pem'),
            ca: fs.readFileSync('/etc/letsencrypt/live/qa.jopl.net/chain.pem')
        }
    },
    
    log_level: 'warning'
};

module.exports = config;
