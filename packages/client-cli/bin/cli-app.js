#!/usr/bin/env node

/**
 * bin file to execute commands
 */
const program = require('commander');
const package_json = require('../package.json');
const AppCommands = require('../commands/app');

const APP_NAMES = ['admin','patient','provider','reporting','fhir'];

//set the command line version to match package.json
program.version(package_json.version);

async function main() {
    program
        .command('build')
        .description('perform any build steps necessary to run an app')
        .argument('[name]', 'The name of the app to build. If omitted, all apps will be built')
        .option('-w, --watch', 'Build in watch mode to automatically rebuild if changes are detected. Only valid if name is supplied.')
        .action(async (name, options, command) => {
            await AppCommands.build(name, options);
        });

    program
        .command('start')
        .description('Start one or more apps')
        .argument('[name]', 'The name of the app to run. If omitted, all apps will be started. One of:' + APP_NAMES.join(','))
        .option('-d, --debug', 'Start the app in debug mode')
        .option('-p, --proxy', 'Use the proxy server and full authentication. If no name is specified, this is ignored.')
        .option('-u, --user <username>', 'Run without the proxy and authenticate as the specified user')
        .action(async (name, options, command) => {
            await AppCommands.start(name, options);
        });

    /*
    program
        .command('stop')
        .description('Stop all running apps')
        .action(async (options, command) => {
            await AppCommands.stop(options);
        });
    */


    await program.parseAsync(process.argv);
}
main();