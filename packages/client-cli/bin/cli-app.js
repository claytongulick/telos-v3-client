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
        .option('-n, --name <name>', 'perform all build steps on the specified app name. One of: ' + APP_NAMES.join(','))
        .option('-a, --all', 'build all apps')
        .action(async (options, command) => {
            await AppCommands.build(options);
        });

    program
        .command('start')
        .description('Start one or more apps')
        .option('-n, --name <name>', 'start specified app, one of: ' + APP_NAMES.join(','))
        .option('-a, --all', 'start all apps')
        .action(async (options, command) => {
            await AppCommands.start(options);
        });

    program
        .command('stop')
        .description('Stop all running apps')
        .action(async (options, command) => {
            await AppCommands.stop(options);
        });


    await program.parseAsync(process.argv);
}
main();