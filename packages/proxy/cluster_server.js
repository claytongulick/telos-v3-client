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

let config = require('./env/config');
let winston = require('winston');
let package_json = require('./package.json');

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
        if (cluster.isMaster) 
            this.startCluster();
        else
            this.startWebapp(process.env.webapp_name);

    }

    configureLogging() {
        winston.remove('console');
        this.logger = winston.createLogger({
            format: winston.format.combine(
                        winston.format.timestamp(),
                        winston.format.printf(info => {
                            return `${process.env.NODE_ENV} ${process.env.webapp_name || ''} ${process.pid} @ ${info.timestamp} - ${info.level}: ${info.message}`
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
     * @param {*} webapp_name 
     */
    spawn(webapp_name) {
        let worker = cluster.fork({ webapp_name });
        let webapp_config = config.webapps[webapp_name];
        this.workers.push(worker);
        worker.on('exit',
            (code, signal) => {
                this.logger.warn(`${webapp_name}: Process ${worker.process.pid} died. Code: ${code}. Signal: ${signal}`);
                let index = this.workers.findIndex(cached_worker => cached_worker.process.pid == worker.process.pid);
                if (index >= -1)
                    this.workers.splice(index, 1);
                //should we restart the process?
                if (webapp_config.auto_restart) {
                    this.logger.warn(`${webapp_name}: Spawning new process.`);
                    this.spawn(webapp_name);
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
        process.env.worker_type = 'master';
        this.logger.info("Starting cluster...");
        let webapp_names = Object.keys(config.webapps);

        for (let webapp_name of webapp_names) {
            let webapp_config = config.webapps[webapp_name];
            if(!webapp_config.enable)
                continue;
            this.logger.info("Spawning " + webapp_config.process_count + " web workers...");
            for (let i = 0; i < webapp_config.process_count; i++) {
                this.spawn(webapp_name);
            }
        }
    }

    /**
     * Set the process to the correct user and group after starting the web server
     * @param {*} app 
     * @param {*} webapp_config 
     */
    downgradePermissions(app, webapp_config) {
        if (webapp_config?.run_as?.enable && ['linux', 'darwin'].includes(process.platform)) {
            this.logger.info("Configuring posix user and group...");
            if (webapp_config.run_as.enable && app?.set)
                app.set('uid', webapp_config.run_as.uid);
            process.setgid(webapp_config.run_as.gid);
            process.setuid(webapp_config.run_as.uid);
            this.logger.info(`Process permissions set to uid: ${webapp_config.run_as.uid} gid: ${webapp_config.run_as.gid}`);
        }
    }

    /**
     * Launch https server process
     * @param {*} app 
     * @param {*} webapp_config 
     */
    launchSSLServer(app, webapp_config) {
        let key_paths = webapp_config.ssl.options;
        let options = {};
        options.key = fs.readFileSync(key_paths.key);
        options.cert = fs.readFileSync(key_paths.cert);
        options.ca = fs.readFileSync(key_paths.ca);
        let https_server = https.createServer(options, app).listen(
            {
                port: webapp_config.ssl.port,
                host: webapp_config.listen_host
            },
            () => {
                this.logger.info(`${webapp_config.name}: HTTPS server listening on ${webapp_config.listen_host}:${webapp_config.ssl.port}`);
                this.downgradePermissions(app);
            }
        );
        return https_server;
    }

    /**
     * Start a configured webapp
     */
    async startWebapp(webapp_name) {
        let webapp_config = config.webapps[webapp_name];
        this.logger.info(`Starting web server worker with process id: ${process.pid}`);

        //set up routes and middleware
        this.logger.info(`Configuring application...`)
        webapp_config.logger = this.logger;
        let app = await require(webapp_config.webapp)(webapp_config);
        let https_server;

        //start listening on the configured port
        let http_server = http.createServer(app).listen(
            {
                port: webapp_config.port,
                host: webapp_config.listen_host,
            },
            () => {
                this.logger.info(`HTTP server listening on ${webapp_config.listen_host}:${webapp_config.port}`);
                //if we also want to do ssl, start a sever on the ssl port
                if (webapp_config.ssl && webapp_config.ssl.enable) {
                    https_server = this.launchSSLServer(app, webapp_config);
                    return;
                }
                this.downgradePermissions(app, webapp_config);
            }
        );

        //listen for a termination signal and kill the web server. This allows for graceful shutdown.
        process.on('SIGTERM',
            () => {
                this.logger.log(`${webapp_name}: pid ${process.pid} received SIGTERM - shutting down web process...`);
                http_server.close();
                if(https_server)
                    https_server.close();
                process.exit();
            });
    }

}

module.exports = ClusterServer;