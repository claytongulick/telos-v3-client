#!/usr/bin/env node

/**
 * bin file to execute commands
 */
 const program = require('commander');
 const package_json = require('../package.json');
 
 //set the command line version to match package.json
 program.version(package_json.version);
 
 program
    .command('database', 'Client database commands', {executableFile: 'cli-database'})
     ;
 
 program.parse(process.argv);
 