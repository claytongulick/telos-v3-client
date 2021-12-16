#!/usr/bin/env node

/**
 * bin file to execute commands
 */
 const program = require('commander');
 const package_json = require('../package.json');
 
 //set the command line version to match package.json
 program.version(package_json.version);
 
 program
    .command('create', 'Create the database schema', {executableFile: 'cli-database-create'})
    .command('drop', 'Drop the database or one or more tables', {executableFile: 'cli-database-drop'})
    .command('init', 'Initialize the database with fixture data', {executableFile: 'cli-database-init'})
     ;
 
 program.parse(process.argv);