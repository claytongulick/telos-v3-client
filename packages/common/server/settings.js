let Setting = require('common/db/models/setting');
/**
 * This class represets client-configurable settings that can be changed in the cient's admin application
 */
class Settings {
    /**
     * Load all settings into a POJO
     */
    static async load() {
        let rows = Setting.findAll();
        let settings = {};
        for(let row of rows) {
            settings[row.name] = Settings.getValue(row);
        }
        return settings;
    }

    /**
     * Get a specific setting
     * @param {string} name 
     */
    static async get(name) {
        let setting = await Setting.findOne({name});

        if(setting)
            return Settings.getValue(setting);
    }

    /**
     * return a type converted value from a setting row
     * @param {*} setting 
     */
    static getValue(setting) {
        switch(setting.type) {
            case "string":
                return setting.value_string;
            case "number":
                return setting.value_number;
            case "object":
                return setting.value_object;
            case "boolean":
                return setting.value_boolean;
            case "date":
                return setting.value_date;
        }
    }

    /**
     * Set the setting with 'name' to the specified value
     * @param {string} name The setting name to set
     * @param {*} value The setting value
     * @param {string} username The username who is setting the value
     * 
     */
    static async set(name, value, username) {
        let setting = await Setting.findOne({name});
        let type = typeof value;
        if(value instanceof Date)
            type='date';

        if(!setting)
            throw new Error(`Setting with name: ${name} does not exist`);

        if(setting.type !== type)
            throw new Error(`Invalid value data type for ${name}, expected ${setting.type} got ${type}`);

        let update = {set_by: username};
        switch(type) {
            case "string":
                update.value_string = value;
            case "number":
                update.value_number = value;
            case "object":
                update.value_object = JSON.stringify(value);
            case "boolean":
                update.value_boolean = value;
            case "date":
                update.value_date = value;
        }
        return await Setting.update(update, {where: {name}});
    }

    /**
     * 
     * @param {import('common/db/models/setting').SettingSchema} setting 
     */
    static async add(setting) {
        await Setting.create(setting);
    }

}

const config = {
    'client-title': {
        name: 'client-title',
        title: 'Organization display name',
        help_text: 'This is the name of your company. It is displayed througout the application in various places.',
        type: 'string',
        value_string: 'RPM Enabled Practice',
        /**
         * 
         * @param {string} value 
         * @returns 
         */
        validate: (value) => {
            if(!(value))
                return false;
            if(value.length < 2)
                return false;
            return true;
        }
    },
    'enabled-auth-flows': {
        name: 'enabled-auth-flows',
        title: 'Enabled authentication flows',
        help_text: `A comma separated list of authentication methods that a user is allowed to use to log into the application. 
        Valid values are: 
        - password
        The user logs in with a traditional username/password combination.
        - otp
        The user is sent a one time password to their mobile device which is used to log in to the application.
        - 2fa
        Two factor authentication. The user logs in with a username/password and is then sent a one time password.
        - webauthn
        Enable advanced security with supported devices. Examples include apple FaceID, Windows Hello, Android Fingerprint
        - oid
        Log in with an open id SSO provider. Requires custom configuration.
        - saml
        Log in with a SAML SSO provider. Requires custom configuration.
        `,
        type: 'string',
        value_string: 'password, otp, webauthn',
        validate: (value) => {
            let valid_options = ['password', 'otp', '2fa', 'webauthn','oid','saml'];
            let values = value.split(',');
            for(let v of values) {
                if(!(valid_options.includes(v.trim())))
                    return false;
            }
            return true;
        }
    }

}

Settings.config = config;

module.exports = Settings;