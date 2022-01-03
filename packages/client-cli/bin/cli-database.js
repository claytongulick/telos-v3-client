#!/usr/bin/env node

/**
 * bin file to execute commands
 */
const program = require('commander');
const package_json = require('../package.json');
const DatabaseCommands = require('../commands/database');

//set the command line version to match package.json
program.version(package_json.version);

async function main() {
    program
        .command('create')
        .description('Create the client database schema')
        .option('-f, --force', 'Drop existing tables if they exist and recreate them')
        .option('-s, --session', 'Create session database. If --force is passed will also destroy the session database. This option will result in an error if NODE_ENV=="production"')
        .option('-y, --seriously', 'Pass this option if you seriously want to modify the session database in production. If this is not passed, this process will refuse to modify session in prod. Only do this if you seriously know what youre doing. Seriously.')
        .action(async (options, command) => {
            await DatabaseCommands.create(options);
        });

    program
        .command('drop')
        .description('Drop the client database')
        .action(async () => {
            await DatabaseCommands.drop();
        });

    program
        .command('init')
        .description('Initialize the database with fixture data')
        .option("-a, --all", "Initialize database with all fixtures. This will delete existing data in the tables and replace it with the fixture data.")
        .option("-n, --name", "Initialize database with specified fixture name. This will replace existing data in the table.")
        .option("-d, --destroy", "Delete all existing data from the table prior to importing fixtures")
        .action(async (options) => {
            await DatabaseCommands.init(options);
        });

    program.parseAsync(process.argv);
}
main();