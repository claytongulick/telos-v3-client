/*
 *   Copyright (c) 2020 Ratio Software, LLC 
 *   All rights reserved.
 *   @author Clayton Gulick <clay@ratiosoftware.com>
 */
'use strict';
const path = require('path');

const WEBAPP_BASE = path.resolve(__dirname,'../');

/**
 default.js

 Default configuration options. These can be overridden in any environment config file.

 Be aware that overriding occurs via Object.assign, so objects will be copied in total, not deep property merge

 Each webapp is configured separately in the webapps dictionary.

 When importing, Object.assign({}, webapp_default, webapp_config) occurs, so default settting can be placed in webapp_default

 @author Clay Gulick
 @email clay@ratiosoftware.com
**/
let config = {
    /**
     * These are default settings that will be applied to all webapps unless overridden by the config of the webapp itself
     */
    client_id: process.env.CLIENT_ID || 'local',
    //setting for sending emails
    email: {
        sendgrid: {
            api_key: process.env.SENDGRID_API_KEY,
        },
        from_address: process.env.FROM_EMAIL_ADDRESS
    },
    sms: {
        twilio: {
            account_sid: "AC3a10e662cd505d25503dc21cd7b8f6c2",
            auth_token: "786d68c671491a51821211a223e2e86e",
            from_phone: "+18175871133"
        }
    },
    //whether to automatically set the username to the email when the user is saved
    email_is_username: false,

    //the path to where templates are stored
    template_path: './templates',

    //the path where email file attachments are stored
    attachment_path: './public',

    //enables user switching after launch
    run_as: {
        enable: false,
        uid: 'app',
        gid: 'app'
    },

    //this is the signing secret for the JWT
    jwt_secret: '74!5!55uP3RS3cr37.D0n773ll4ny0N3!',

    //Should ratelimiting be enabled?
    disable_rate_limit: true,

    //cryptographic settings for passwords etc...
    crypto: { 
        digest: 'sha512',
        hash_iterations: 25000,
        hash_key_length: 512,
        hash_encoding: 'hex',
        salt_length: 32,
        //this is the secret used for symmetric encryption
        encryption_secret: 'all along the watchtower, princes kept the view',
    },

    //autommatically restart failed processes
    auto_restart: true,

    //the port to bind to for non-ssl traffic
    port: 3000,
    //the network interface to bind to. DNS entries will work for this as long as they are locally resolvable, like in the hosts file, for example
    listen_host: '127.0.0.1',
    //ssl configuration
    ssl: {
        //should ssl be enabled?
        enable: false,
        //should we force a redirect to ssl if a request comes in on a non-ssl port?
        force: false,
        //the ssl port to listen on
        port: 3443,
        //the options object that will be passed directly to the network listener
        options: {
            key: '',
            cert: '',
            ca: ''
        },
    },
    //how many CPU processes to cluster across for the webapp
    process_count: 1,
    //the logging level to use for app logging
    log_level: 'info',
    //web request logging config
    web_logs: {
        type: 'file', //log requests to console. Valid options are 'console' or 'file'
        type: 'combined', //apache 'combine' format
        //this path must be writable by the user configured in the "run_as" setting
        path: '/home/app/logs/admin', //if type is 'file' the folder to store log rotation
        rotation_interval: '1d' //rotate daily
    },

};

module.exports = config;
