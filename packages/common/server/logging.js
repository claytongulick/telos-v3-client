let winston = require('winston');

/**
 * 
 * @typedef {Object} LoggingConfig
 * @property {Object} package_json The logging level to use for logging output
 * @property {string} log_level The logging level to use for logging output
 * 
 * Logging utility class
 */
class Logging {

    /**
     * 
     * @param {LoggingConfig} config 
     * @returns 
     */
    static getLogger(config) {
        if(this.logger)
            return this.logger;
        winston.remove('console');
        this.logger = winston.createLogger({
            format: winston.format.combine(
                        winston.format.timestamp(),
                        winston.format.printf(info => {
                            return `${process.env.NODE_ENV} ${config.cluster.package_json.name} ${process.pid} @ ${info.timestamp} - ${info.level}: ${info.message}`
                        })
                    ),
            transports: [
                new winston.transports.Console({
                    timestamp: true,
                    level: config.logging.log_level,
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

        return this.logger;
    }

}

module.exports = Logging;