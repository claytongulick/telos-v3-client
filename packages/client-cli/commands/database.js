const Models = require('common/db/models');

let init_functions = {
    users: async function() {

    },

    settings: async function() {
        let Settings = require('common/server/settings');
        let Setting = Models.Setting;
        let default_settings = Object.keys(Settings.config);
        for(let default_setting of default_settings) {
            await Setting.create(Settings.config[default_setting]);
        }
    }
}

class Database {
    static async create(options) {
        const sequelize = await require('common/db/sequelize').connect(process.env.CLIENT_DB_URI);
        await sequelize.sync({ force: options.force });
    }

    static async init(options) {
        let valid_fixtures = ['users','settings'];

        if(options.all) {
            for(let fixture of valid_fixtures) {
                await init_functions[fixture]();
            }
            return;
        }

        if(options.name) {
            if(!valid_fixtures.includes(options.name))
                throw new Error("Invalid fuxture name: " + options.name)

            await init_functions[options.name]();
            return;
        }

        console.error("Either --all or --name must be specified");
    }

}

module.exports = Database;