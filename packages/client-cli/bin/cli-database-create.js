#!/usr/bin/env node

/**
 * bin file to execute commands
 */
const program = require('commander');
const package_json = require('../package.json');
const Models = require('common/db/models');

//set the command line version to match package.json
program.version(package_json.version)
    .option('-f, --force', 'Drop existing tables if they exist and recreate them')

program.parse(process.argv);

async function main() {
    const sequelize = await require('common/db/sequelize').connect(process.env.CLIENT_DB_URI);
    await sequelize.sync({force: program.force});
}

main();