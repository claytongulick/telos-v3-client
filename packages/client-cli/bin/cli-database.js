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
        .action(async (options) => {
            await DatabaseCommands.init(options);
        });

    program.parseAsync(process.argv);
}
main();