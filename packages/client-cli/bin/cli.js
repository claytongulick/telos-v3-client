#!/usr/bin/env node

/**
 * bin file to execute commands
 */
const program = require('commander');
const package_json = require('../package.json');
const path = require('path');

let dotenv = require('dotenv');
dotenv.config({
    path: path.resolve(__dirname,'..','..','..','.env')
});

//set the command line version to match package.json
program.version(package_json.version);

program
    .command('database', 'Client database commands', { executableFile: 'cli-database' })
    .command('app', 'App management commands', { executableFile: 'cli-app' })
    .command('user', 'User management commands', { executableFile: 'cli-user' })
    .command('fhir', 'FHIR application commands', { executableFile: 'cli-fhir' })
    ;

program.parse(process.argv);
