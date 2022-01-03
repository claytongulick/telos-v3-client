const package_json = require('../package.json');
const path = require('path');

/**
 * 
 * config.js
 * 
 * This provides applicaiton specific config options.
 * 
 * It should reflect any environment specific configuration via process.env.VARIABLE_NAME,
 * all environment specific configuration should be handled via dotenv and /etc/environment
 * 
 * /etc/environment should be sourced in systemd unit files via EnvironmentFile=/etc/environment
 * 
 * @typedef {Object} EmailConfig
 * @property {Object} provider Sendgrid config
 * @property {string} provider.api_key The key to use for sendgrid
 * @property {string} from_address The address to send the email from
 * 
 * @typedef {Object} SMSConfig
 * @property {Object} twilio Twilio config settings
 * @property {string} twilio.account_sid
 * @property {string} twilio.auth_token
 * @property {string} twilio.from_phone
 * 
 * @typedef {Object} CryptoConfig
 * @property {string} digest
 * @property {number} hash_iterations
 * @property {number} hash_key_length
 * @property {string} hash_encoding
 * @property {number} salt_length
 * @property {string} encryption_secret This should be the same as client_secret
 * 
 * @typedef {Object} Config
 * @property {string} client_id The unique id for the client
 * @property {ClusterConfig} cluster Setting to configure the cluster server 
 * @property {ExpressConfig} express Express server settings
 * @property {EmailConfig} email Email configuration
 * @property {SMSConfig} sms SMS configuration
 * @property {string} template_path The path to the template files used by express
 * @property {string} attachment_path When sending emails, the path where file attachments are stored
 * @property {string} client_secret Encryption key used for signing jwts and other crypto functions. Should be unique per client
 * @property {boolean} disable_rate_limit Used for debugging, disables all rate limits
 * @property {CryptoConfig} crypto Symmetric cryptography options
 * @property {LoggingConfig} logging Logging configuration
 *
 *
 * @author Clay Gulick
 * @email clay@ratiosoftware.com
*/

/**
 * @type {Config}
 */
let config = {
    client_id: process.env.CLIENT_ID || 'local',
    /** @type {import('../../common/server/cluster-server').ClusterConfig} */
    cluster: {
        package_json,
        process_count: process.env.AUTH_PROCESS_COUNT,
        auto_restart: true,
        run_as: {
            enable: process.env.AUTH_RUNAS_ENABLE == '1',
            uid: process.env.AUTH_RUNAS_UID,
            gid: process.env.AUTH_RUNAS_GID,
        },
        port: process.env.AUTH_HTTP_PORT,
        listen_host: process.env.AUTH_HOST,
        ssl: {
            enable: false,
            port: 3443,
            options: {
                key: '',
                cert: '',
                ca: ''
            },
        },
    },
    /** @type {import('../../common/server/express-server').ExpressConfig} */
    express: {
        package_json,
        statics_dir: path.resolve(__dirname,'..','dist'),
        mount_path: '/auth',
        force_ssl: false,
        enable_compression: true,
        compression_level: 6,
        //web request logging config
        web_logs: {
            file_name: package_json.name,
            type: 'combined', //apache 'combine' format
            //this path must be writable by the user configured in the "run_as" setting
            path: '/home/app/logs/auth', //if type is 'file' the folder to store log rotation
            rotation_interval: '1d' //rotate daily
        },
        is_proxied: true

    },
    email: {
        provider: {
            api_key: process.env.EMAIL_API_KEY,
        },
        from_address: process.env.FROM_EMAIL_ADDRESS
    },
    sms: {
        twilio: {
            account_sid: process.env.TWILIO_ACCOUNT_SID,
            auth_token: process.env.TWILIO_AUTH_TOKEN,
            from_phone: process.env.TWILIO_PHONE_NUMBER
        }
    },
    template_path: './templates',
    attachment_path: './public',
    client_secret: process.env.CLIENT_SECRET,
    disable_rate_limit: true,
    /** @type {import('../../common/server/logging').LoggingConfig} */
    logging: {
        //give the logger access to package.json so that it can log out messages
        package_json,
        //autommatically restart failed processes
        //the logging level to use for app logging
        log_level: 'info',

    }
};

module.exports = config;
