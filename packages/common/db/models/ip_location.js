const { DataTypes, Model } = require('sequelize');
/**
 * @typedef {Object} Activity
 * @property {number} id The unique id for the activity
 * @property {string} user_id The UUID for the user that performed the activity
 * @property {string} client_id The client if of the user that performed the activity
 * @property {string} type The type of activity that took place
 * @property {Object} data Data that's associated with the activity, will vary based on type
 * @property {boolean} phi Indicates whether this activity involved PHI
 * @property {string} patient_resource If this was activity involving a single patient, this is the URI for the patient
 * @property {Date} create_date
 * @property {Date} update_date
 */
let schema = {
    /**
     * The unique id for the activity
     */
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },

    /**
     * First IP address in the block
     */
    ip_start: DataTypes.STRING,

    /**
     * Integer representation of ip address used for fast search
     */
    ip_start_integer: DataTypes.INTEGER,

    /**
     * Last IP address in the block
     */
    ip_end: DataTypes.STRING,

    /**
     * Integer representation of ip address used for fast search
     */
    ip_end_integer: DataTypes.INTEGER,

    /**
     * Two-letter continent code [AF: String, AS, EU, NA, OC, SA, AN]
     */
    continent: DataTypes.STRING,

    /**
     * ISO 3166-1 alpha-2 country code
     */
    country: DataTypes.STRING,

    /**
     * State or Province name
     */
    stateprov: DataTypes.STRING,

    /**
     * City name
     */
    city: DataTypes.STRING,

    /**
     * Decimal latitude
     */
    latitude: DataTypes.DECIMAL,

    /**
     * Decimal longitude
     */
    longitude: DataTypes.DECIMAL 
}

/**
 * @type {typeof import('sequelize').Model}
 */
class IPLocation extends Model {

}

let sequelize = require('../sequelize').get(process.env.CLIENT_DB_URI);

let model_options = {
    sequelize, // We need to pass the connection instance
    modelName: 'ip_location', // We need to choose the model name
    createdAt: 'create_date',
    updatedAt: 'update_date',
    indexes: [
        { fields: ['ip_start', 'ip_end'] },
        { fields: ['ip_start_integer', 'ip_end_integer'] }

    ]
}

IPLocation.init(schema, model_options);
module.exports = IPLocation;