const Models = require('common/db/models');

let init_functions = {
    users: async function() {
        let User = Models.User;
        let users = require('common/db/fixtures/users');
        for(let new_user of users) {
            let user = await User.create(new_user);
            await user.setPassword(new_user.password)
        }

    },

    settings: async function() {
        let Settings = require('common/server/settings');
        let Setting = Models.Setting;
        let default_settings = Object.keys(Settings.config);
        for(let default_setting of default_settings) {
            await Setting.create(Settings.config[default_setting]);
        }
    },
    communication: async function() {
        let templates = require('common/db/fixtures/communication_templates');
        let CommunicationTemplate = Models.CommunicationTemplate;
        for(let template of templates) {
            await CommunicationTemplate.create(template); //this will compile the template and save it
        }
    }
}

let destroy_functions = {
    users: async function() {
        let User = Models.User;
        await User.destroy({truncate: true});
    },

    settings:  async function() {
        let Setting = Models.Setting;
        await Setting.destroy({truncate: true});
    },
    communication: async function() {
        let CommunicationTemplate = Models.CommunicationTemplate;
        await CommunicationTemplate.destroy({truncate: true});
    }
}

class DatabaseCommands {
    static async create(options) {
        const sequelize = await require('common/db/sequelize').connect('client');
        await sequelize.sync({ force: options.force });
        if(options.session) {
            if((!options.seriously) && process.env.NODE_ENV == 'production') {
                throw new Error("Refusing to modify session table in production. Consider your wrist to be slapped. Don't do this again.");
            }
            if(process.env.NODE_ENV == 'production') {
                console.warn("Modifying production session table. I hope you know what you're doing.");
            }
            const session_sequelize = await require('common/db/sequelize').connect('session');
            let Session = require('common/db/models/session');
            await session_sequelize.sync({ force: options.force });
        }
        sequelize.close();
    }

    static async drop(options) {
        const sequelize = await require('common/db/sequelize').connect('client');
        await sequelize.drop();
        sequelize.close();
    }

    static async init(options) {
        const sequelize = await require('common/db/sequelize').connect('client');
        let valid_fixtures = ['users','settings','communication'];

        if(options.all) {
            if(options.destroy) {
                for(let fixture of valid_fixtures) {
                    await destroy_functions[fixture]();
                }
            }
            for(let fixture of valid_fixtures) {
                await init_functions[fixture]();
            }
            sequelize.close();
            return;
        }

        if(options.name) {
            if(!valid_fixtures.includes(options.name))
                throw new Error("Invalid fuxture name: " + options.name)

            if(options.destroy) {
                await destroy_functions[options.name]();
            }
            await init_functions[options.name]();
            sequelize.close();
            return;
        }

        console.error("Either --all or --name must be specified");
    }

}

module.exports = DatabaseCommands;