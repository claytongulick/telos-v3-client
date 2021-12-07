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

let winston = require('winston');
/**
 * 
 * @typedef {Object} PackageJSON The package.json of the client package, for use in logging
 * @property {string} name
 * @property {string} version
 * @property {string} description
 *
 * @typedef {Object} SSLConfig
 * @property {boolean} enable should ssl be enabled?
 * @property {boolean} force should we force a redirect to ssl if a request comes in on a non-ssl port?
 * @property {numner} port the ssl port to listen on
 * @property {Object} options the options object that will be passed directly to the network listener
 *
 * @typedef {Object} RunAs Process user impersonation
 * @property {boolean} enable Whether process user impersonation should be used
 * @property {string} gid The group id to switch to
 * @property {string} uid The user id to switch to after launch
 * 
 * @typedef {Object} ClusterConfig
 * @property {PackageJSON} package_json reference to the package.json for the application
 * @property {number} process_count The number of worker processes to spawn
 * @property {boolean} auto_restart Should the server auto restart the process when it fails?
 * @property {RunAs} run_as Process impersonation / downgrading
 * @property {number} port The port to run the server on
 * @property {string} listen_host The host interface to listen on, 127.0.0.1 for loopback
 * @property {SSLConfig} ssl SSL configuration
 * 
 * Cluster server
 */
class ClusterServer {
    logger;
    workers = [];

    /**
     * Instantiate a new cluster server
     * 
     * @param {*} app A NodeJS style (req, res) function. Normally an express app.
     * @param {*} loger The logger to use for server messages and errors
     * @param {ClusterConfig} config 
     */
    constructor(app, logger, config){
        this.app = app;
        this.logger = logger;
        this.config = config;
    }

    /**
     * This is the main entrypoint for the current running process
     */
    start() {
        this.setEnvironment();

        //if this is the master process, fork the number of desired cluster processes.
        //for simplified debugging when running locally, or optionally in any environment where process_count == 1, we skip
        //the cluster creation and just run a single process
        if (cluster.isMaster && config.process_count > 1) 
            this.startCluster();
        else
            this.startWebapp();

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
    downgradePermissions() {
        let app = this.app;
        let config = this.config;

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
    launchSSLServer() {
        let app = this.app;
        let config = this.config;

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
        let app = this.app;
        let config = this.config;

        this.logger.info(`Starting web server worker with process id: ${process.pid}`);

        //set up routes and middleware
        this.logger.info(`Configuring application...`)
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
                    this.https_server = this.launchSSLServer();
                    return;
                }
                this.downgradePermissions();
            }
        );

        //listen for a termination signal and kill the web server. This allows for graceful shutdown.
        process.on('SIGTERM',
            () => {
                this.logger.info(`${package_json.name}: pid ${process.pid} received SIGTERM - shutting down web process...`);
                this.http_server.close();
                if(this.https_server)
                    this.https_server.close();
                process.exit();
            });
    }

}

module.exports = ClusterServer;