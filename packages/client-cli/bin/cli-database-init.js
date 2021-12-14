#!/usr/bin/env node

/**
 * bin file to execute commands
 */
const program = require('commander');
const package_json = require('../package.json');

//set the command line version to match package.json
program.version(package_json.version);

program
    .command('create', 'Create the database schema')
    .command('drop', 'Drop the database or one or more tables')
    .command('init', 'Initialize the database with fixture data')
    ;

program.parse(process.argv);

async function main() {

}

main();