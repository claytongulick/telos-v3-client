const { DataTypes, Model } = require('sequelize');

let schema = {
    /**
     * The unique id for the user
     */
    id: {
        type: DataTypes.UUID,
        /**
         * UUID v1 is used so that it can be reversed into a timestamp and machine mac address, if needed
         */
        defaultValue: DataTypes.UUIDV1,
        primaryKey: true

    },

    /**
     * The unique username for the user. In most cases, this should be use the user's email address
     */
    username: {
        type: DataTypes.STRING,
        unique: true, //adds an index automatically
        allowNull: false
    },

    /**
     * In most cases, this will be the same as the username. In the cases where we have a system that requires an alternate username, 
     * we have the separate email address for redundancy
     */
    email_address: {
        type: DataTypes.STRING,
        allowNull: false
    },

    first_name: {
        type: DataTypes.STRING,
        allowNull: false
    },

    last_name: {
        type: DataTypes.STRING,
        allowNull: false
    },

    /**
     * The mobile phone number for the user. This will be used to send SMS messages.
     */
    phone: {
        type: DataTypes.STRING,
    },

    /**
     * An array of user roles
     */
    roles: {
        type: DataTypes.ARRAY(DataTypes.STRING),
        allowNull: false,
        validator: {
            isIn: {
                args: [['admin','provider','patient']],
                msg: 'Must be a valid role'
            }
        }
    },

    /**
     * If this user is associated with a FHIR entity, this is the URL to the FHIR resource
     */
    resource: DataTypes.STRING,

    /**
     * The current status of the user's account
     */
    account_status: {
        type: DataTypes.STRING,
        defaultValue: 'active',
        allowNull: false,
        validator: {
            isIn: {
                args: [['active','locked','inactive','flagged']]
            }
        }
    },

    //one-time-password fields

    /**
     * The randomized generated code
     */
    otp_code: DataTypes.STRING,

    /**
     * The datetime the code was generated
     */
    otp_created_date: DataTypes.DATE, //used to expire the OTP. Expiration is 3 minutes.

    /**
     * The number of attempts that have been made
     */
    otp_attempts: DataTypes.INTEGER, //we allow 3 attempts before a new code needs to be generated

    /**
     * Whether the current code has been used for authentication already
     */
    otp_consumed: DataTypes.BOOLEAN,

    /**
     * When the code was used
     */
    otp_consumed_date: DataTypes.DATE,

    /**
     * The session id that was created from consuming the nonce
     */
    otp_sid: DataTypes.STRING,

    //password fields
    hash: {
        type: DataTypes.STRING(1024)
    },

    salt: {
        type: DataTypes.STRING
    },

    /**
     * Dictionary of notification channels and last notification read timestamp
     * This is used to keep track of the last notification a user read from a channel
     * looks like: {
     *  "channel-name": Date,
     *  "another-channel": Date,
     *  ...
     * }
     */
    notification_channels: DataTypes.JSONB,

    /**
     * A dictionary of user preferences, such as notification mechanisms (sms, email, app)
     */
    preferences: DataTypes.JSONB
}

/**
 * @type {typeof import('sequelize').Model}
 */
class User extends Model {
    async setPassword(password) {
        let Encryption = require('../../server/encryption');
        let {hash, salt} = await Encryption.hash(password);
        this.hash = hash;
        this.salt = salt;
        await this.save();
    }

    async checkPassword(password) {
        let Encryption = require('../../server/encryption');
        return await Encryption.verifyPassword(this.hash, password, this.salt);
    }

}

let sequelize = require('../sequelize').get(process.env.CLIENT_DB_URI);

let model_options = {
    sequelize, // We need to pass the connection instance
    modelName: 'User', // We need to choose the model name
    tableName: 'application_user',
    createdAt: 'create_date',
    updatedAt: 'update_date',
    defaultScope: {
        attributes: {
            include: ['id','username','email_address','first_name','last_name','phone','roles','resource','account_status','preferences']
        }
    }
}

let admin_options = {

}

User.init(schema, model_options);
User.admin_options = admin_options;
module.exports = User;