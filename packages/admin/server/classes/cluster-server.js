/**
 cluster_server.js

 Starting point for launching a clustered web server.

 @author Clay Gulick
 @email clay@ratiosoftware.com
**/
let cluster = require('cluster'),
    http = require('http'),
    https = require('https'),
    fs = require('fs');

let config = require('../../env/config');
let winston = require('winston');
let package_json = require('../../package.json');

class ClusterServer {
    logger;
    workers = [];

    /**
     * This is the main entrypoint for the current running process
     */
    start() {
        this.setEnvironment();
        this.configureLogging();

        //if this is the master process, fork the number of desired cluster processes.
        //for simplified debugging when running locally, or optionally in any environment where process_count == 1, we skip
        //the cluster creation and just run a single process
        if (cluster.isMaster && config.process_count > 1) 
            this.startCluster();
        else
            this.startWebapp();

    }

    configureLogging() {
        winston.remove('console');
        this.logger = winston.createLogger({
            format: winston.format.combine(
                        winston.format.timestamp(),
                        winston.format.printf(info => {
                            return `${process.env.NODE_ENV} ${package_json.name} ${process.pid} @ ${info.timestamp} - ${info.level}: ${info.message}`
                        })
                    ),
            transports: [
                new winston.transports.Console({
                    timestamp: true,
                    level: 'verbose',
                    colorize: true,
                    prettyPrint: true,
                    depth: 5,
                    humanReadableUnhandledException: true,
                    showLevel: true,
                }),
            ]
        });
        this.logger.on('error', 
            e => {
                console.error(e)
            }
        );
    }

    setEnvironment() {
        //first, evaluate the current NODE_ENV for a valid environment
        let environments = ['local','development','qa','production'];

        if(environments.indexOf(process.env.NODE_ENV) < 0) {
            winston.warn('Invalid or missing NODE_ENV value: ' + process.env.NODE_ENV + ', should be one of: ' + environments.join(',') + '. Defaulting to "local".');
            process.env.NODE_ENV = 'local';
        }
    }

    /**
     * Spawn a worker process
     */
    spawn() {
        let worker = cluster.fork();
        worker.on('exit',
            (code, signal) => {
                this.logger.warn(`${package_json.name}: Process ${worker.process.pid} died. Code: ${code}. Signal: ${signal}`);
                //should we restart the process?
                if (config.auto_restart) {
                    this.logger.warn(`${package_json.name}: Spawning new process.`);
                    this.spawn();
                }
            });
    }

    /**
     * Start a cluster of worker processes and monitor their health, with optional automatic restart of a failed
     * process.
     */
    startCluster() {
        this.logger.info(`Starting ${package_json.name} v${package_json.version}`);
        this.logger.info(package_json.description);
        this.logger.info("Configuring environment: " + process.env.NODE_ENV);
        this.logger.info("Starting cluster...");
        this.logger.info("Spawning " + config.process_count + " web workers...");
        for (let i = 0; i < config.process_count; i++) {
            this.spawn();
        }
    }

    /**
     * Set the process to the correct user and group after starting the web server
     * @param {*} app 
     */
    downgradePermissions(app) {
        if (config?.run_as?.enable && ['linux', 'darwin'].includes(process.platform)) {
            this.logger.info("Configuring posix user and group...");
            if (config.run_as.enable && app?.set)
                app.set('uid', config.run_as.uid);
            process.setgid(config.run_as.gid);
            process.setuid(config.run_as.uid);
            this.logger.info(`Process permissions set to uid: ${config.run_as.uid} gid: ${config.run_as.gid}`);
        }
    }

    /**
     * Launch https server process
     * @param {*} app 
     */
    launchSSLServer(app) {
        let key_paths = config.ssl.options;
        let options = {};
        options.key = fs.readFileSync(key_paths.key);
        options.cert = fs.readFileSync(key_paths.cert);
        options.ca = fs.readFileSync(key_paths.ca);
        let https_server = https.createServer(options, app).listen(
            {
                port: config.ssl.port,
                host: config.listen_host
            },
            () => {
                this.logger.info(`${config.name}: HTTPS server listening on ${config.listen_host}:${config.ssl.port}`);
                this.downgradePermissions(app);
            }
        );
        return https_server;
    }

    /**
     * Start the webapp
     */
    async startWebapp() {
        this.logger.info(`Starting web server worker with process id: ${process.pid}`);

        //set up routes and middleware
        this.logger.info(`Configuring application...`)
        config.logger = this.logger;
        let app = await require('./express-server')(this);
        let https_server;

        //start listening on the configured port
        this.http_server = http.createServer(app).listen(
            {
                port: config.port,
                host: config.listen_host,
            },
            () => {
                this.logger.info(`HTTP server listening on ${config.listen_host}:${config.port}`);
                //if we also want to do ssl, start a sever on the ssl port
                if (config.ssl && config.ssl.enable) {
                    this.https_server = this.launchSSLServer(app, config);
                    return;
                }
                this.downgradePermissions(app, config);
            }
        );

        //listen for a termination signal and kill the web server. This allows for graceful shutdown.
        process.on('SIGTERM',
            () => {
                this.logger.log(`${package_json.name}: pid ${process.pid} received SIGTERM - shutting down web process...`);
                this.http_server.close();
                if(this.https_server)
                    this.https_server.close();
                process.exit();
            });
    }

}

module.exports = ClusterServer;