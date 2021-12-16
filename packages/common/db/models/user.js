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
    email_address: DataTypes.STRING,

    first_name: {
        type: DataTypes.STRING,
        allowNull: false
    },

    last_name: {
        type: DataTypes.STRING,
        allowNull: false
    },

    /**
     * If this user is associated with a FHIR entity, this is the URL to the FHIR resource
     */
    resource: DataTypes.STRING,

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
    otp_sid: DataTypes.STRING
}

/**
 * @type {typeof import('sequelize').Model}
 */
class User extends Model {

}

let sequelize = require('../sequelize').get(process.env.CLIENT_DB_URI);

let model_options = {
    sequelize, // We need to pass the connection instance
    modelName: 'application_user', // We need to choose the model name
    createdAt: 'create_date',
    updatedAt: 'update_date'
}

User.init(schema, model_options);
module.exports = User;