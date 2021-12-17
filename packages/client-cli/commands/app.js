const shell = require('shelljs');
const path = require('path');
const deploy_path = path.resolve(
    __dirname, // this is ~/deploy/packages/client-cli/commands
    '..', //~/deploy/packages/client-cli
    '..', //~/deploy/packages
    '..', //~/deploy
    );
const packages_path = path.resolve(deploy_path, 'packages');

let proxy_process;
let auth_process;
let admin_process;
let patient_process;
let provider_process;
let fhir_process;
let superset_process;

function buildApp(app_name, options) {
    shell.cd(path.resolve(packages_path,app_name));
    if(options.watch) {
        shell.exec('webpack --watch');
    }
    else
        shell.exec('webpack')
}

function startApp(name, options) {
    let inspect = '';
    let java_debug = '';
    let auth = '';
    if(options.user)
        auth = `--auth ${options.user}`;
    if(options.debug) {
        inspect = '--inspect';
        java_debug = '-agentlib:jdwp=transport=dt_socket,server=y,suspend=n,address=1044';
    }
    switch(name) {
        case 'auth':
            auth_process = shell.exec(`node ${inspect} ./auth/server.js ${auth}`,{async: true});
            break;
        case 'admin':
            admin_process = shell.exec(`node ${inspect} ./admin/server.js ${auth}`,{async: true});
            break;
        case 'patient':
            patient_process = shell.exec(`node ${inspect} ./patient/server.js ${auth}`,{async: true});
            break;
        case 'provider':
            provider_process = shell.exec(`node ${inspect} ./provider/server.js ${auth}`,{async: true});
            break;
        case 'proxy':
            proxy_process = shell.exec(`node ${inspect} ./proxy/server.js ${auth}`,{async: true});
            break;
        case 'fhir':
            fhir_process = shell.exec(`java ${java_debug} -jar ../fhir-server/target/fhir-server.war`,{async: true});
            break;
        case 'superset':
            superset_process = shell.exec(`gunicorn -k gevent --timeout 120 -b 127.0.0.1:5000 --limit-request-line 0 --limit-request-field_size 0 "superset.app:create_app()"`, {async: true});
            break;
        default:
            throw new Error("Unknown app:" + name);
    }

}

/**
 * Class that handles application building.
 */
class AppCommands {
    static async build(name, options) {
        let apps = ['admin','auth','patient','provider'];
        if(!name) {
            for(let app in apps) {
                buildApp(app, options);
            }
            return;
        }

        buildApp(name, options);
    }

    static async start(name, options) {
        let apps = ['admin','auth','patient','provider','proxy','fhir','superset'];

        shell.cd(packages_path);
        if(!name) {
            for(let app of apps) {
                startApp(app, options);
            }
            return;
        }
        startApp(name, options);
    }
}

module.exports = AppCommands;