/*
 *   Copyright (c) 2020 Ratio Software, LLC 
 *   All rights reserved.
 *   @author Clayton Gulick <clay@ratiosoftware.com>
 */
'use strict';
const path = require('path');

const WEBAPP_BASE = path.resolve(__dirname,'../webapps');

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
    webapp_default: {
        client_id: process.env.CLIENT_ID || 'local',
        //setting for sending emails
        email: {
            sendgrid: {
                api_key: "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",
            },
            from_address: 'support@kithandkin.app'
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
        auto_restart: true
    },

    webapps: {
        /**
         * This is this http-proxy server. It's a very basic proxy that just redirects traffic from a public host to one or more targets.
         */
        'proxy_server': {
            enable: true,
            process_count: 2,
            host: 'api-proxy.teloshs.com',
            webapp: WEBAPP_BASE +  '/proxy-server/server.js',
            port: 80,
            listen_host: '0.0.0.0',
            ssl: {
                enable: false,
                force: false,
                port: 443,
                options: {
                    key: '/etc/letsencrypt/live/api-proxy.teloshs.com/privkey.pem',
                    cert: '/etc/letsencrypt/live/api-proxy.teloshs.com/cert.pem',
                    ca: '/etc/letsencrypt/live/api-proxy.teloshs.com/chain.pem'
                },
            },
            /**
             * Should appmetrics dashboard be enabled?
             */
            appmetrics: {
                enable: true,
                //the host the dashboard should listen on
                host: '127.0.0.1',
                //the port the dashboard should listen on
                port: '1234',
                //the path to the dashboard
                path: 'metrics'
            },
            /**
             * This is a list of public hosts that the proxy server will redirect for
             */
            proxied_hosts: [
                /**
                 * This is a user interface for the proxy server itself. It redirects to a web process running on port 3000.
                 */
                {
                    public_hostname: 'proxy-admin.teloshs.com',
                    ssl: {
                        enable: true,
                        force: true,
                        options: {
                            key: '/etc/letsencrypt/live/proxy-admin.teloshs.com/privkey.pem',
                            cert: '/etc/letsencrypt/live/proxy-admin.teloshs.com/cert.pem',
                            ca: '/etc/letsencrypt/live/proxy-admin.teloshs.com/chain.pem'
                        },
                    },
                    target: {
                        url: 'http://localhost:3000'
                    },
                    mirrors:[
                        {
                            url: 'http://localhost:4000'
                        }
                    ]                 
                },
                /**
                 * Proxy the legacy environment over to two targets:
                 * 1) Continue the legacy one
                 * 2) mirror traffic to the new environment at readings.teloshs.com
                 */
                {
                    public_hostname: 'readings.telosrpm.com',
                    ssl: {
                        enable: true,
                        force: true,
                        options: {
                            key: '/etc/letsencrypt/live/telosrpm.com/privkey.pem',
                            cert: '/etc/letsencrypt/live/telosrpm.com/cert.pem',
                            ca: '/etc/letsencrypt/live/telosrpm.com/chain.pem'
                        }
                    },
                    target: {
                        url: 'https://telos-readings-prod.us-east-1.elasticbeanstalk.com'
                    },
                    mirrors: [
                        {
                            url: 'https://readings-v2.teloshs.com'
                        },
                    ]
                },
                {
                    public_hostname: 'api.telosrpm.com',
                    ssl: {
                        enable: true,
                        force: true,
                        options: {
                            key: '/etc/letsencrypt/live/telosrpm.com/privkey.pem',
                            cert: '/etc/letsencrypt/live/telosrpm.com/cert.pem',
                            ca: '/etc/letsencrypt/live/telosrpm.com/chain.pem'
                        }
                    }, 
                    target: {
                        url: 'https://telos-readings-prod.us-east-1.elasticbeanstalk.com'
                    },
                    mirrors: [
                        {
                            url: 'https://api-v2.teloshs.com'
                        },
                    ]
                },
                {
                    public_hostname: 'app.telosrpm.com',
                    ssl: {
                        enable: true,
                        force: true,
                        options: {
                            key: '/etc/letsencrypt/live/telosrpm.com/privkey.pem',
                            cert: '/etc/letsencrypt/live/telosrpm.com/cert.pem',
                            ca: '/etc/letsencrypt/live/telosrpm.com/chain.pem'
                        }
                    },
                    target: {
                        url: 'https://app-v2.teloshs.com',
                    },
                },
                {
                    public_hostname: 'telosrpm.com',
                    ssl: {
                        enable: true,
                        force: false,
                        options: {
                            key: '/etc/letsencrypt/live/telosrpm.com/privkey.pem',
                            cert: '/etc/letsencrypt/live/telosrpm.com/cert.pem',
                            ca: '/etc/letsencrypt/live/telosrpm.com/chain.pem'
                        }
                    },
                    target: {
                        url: 'http://localhost:3000',
                    },
                },
            ]
        },
        'admin': {
            enable: true,
            name: 'admin',
            //this is the public DNS that this app is accessed with - it should always match the host header
            host: 'api-proxy.teloshs.com',
            //this is the name of the file that will be loaded to launch the server.
            webapp: WEBAPP_BASE +  '/admin/server.js',
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
        },
    },

};

module.exports = config;
