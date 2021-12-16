#!/usr/bin/env node

/**
 * bin file to execute commands
 */
const program = require('commander');
const package_json = require('../package.json');
const FhirCommands = require('../commands/user');

//set the command line version to match package.json
program.version(package_json.version);

async function main() {
    program
        .command('create')
        .description('Create a new application user')
        .option('-u, --username <username>', 'The username for the new user. If this is missing, the email address will be used.')
        .requiredOption('-e, --email <email>', 'The email address for the new user.')
        .requiredOption('-r, --role <role>', 'The user role, must be one of: admin, practitioner, patient.')
        .requiredOption('-f, --first-name <first_name>', 'The first name of the user.')
        .requiredOption('-l, --last-name <last_name>', 'The first name of the user.')
        .requiredOption('-p, --phone <phone>', 'The mobile phone number for the user, this will be used to send SMS messages.')
        .option('-r, --resource', 'The URL of the FHIR resource for the user. If the role is practioner or patient and this is missing, a new resource will be created in the FHIR database.')
        .action(async (options, command) => {
            await UserCommands.create(options);
        });

    program
        .command('lock')
        .description('Lock a user account to prevent the user from logging into the system.')
        .argument('<username>')
        .action(async (username, options) => {
            await UserCommands.lock(username, options);
        });

    program
        .command('unlock')
        .description('Unlock a previously locked user account')
        .argument('<username>')
        .action(async (username, options) => {
            await UserCommands.unlock(username, options);
        });

    let password_command = program.Command('password')
        .description('Manage a user password');
    password_command
        .command('set')
        .argument('<username>', 'The user that will have their password changed')
        .argument('<password>', 'The new password for the user')
        .description('Set a user password')
        .action(async (username, password, options) => {
            await UserCommands.setPassword(username, password, options);
        });
        
    password_command
        .command('reset')
        .description('Send out a password reset link to the user')
        .argument('<username>', 'The user to send the reset link to')
        .action(async (username, options, command) => {
            await UserCommands.resetPassword(username, options);
        });

    program.addCommand(password_command);

    await program.parseAsync(process.argv);
}
main();