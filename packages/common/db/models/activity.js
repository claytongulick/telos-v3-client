const { DataTypes, Model } = require('sequelize');
/**
 * @typedef {Object} ActivitySchema
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
     * The user that performed the activity
     */
    user_id: {
        type: DataTypes.UUID,
        allowNull: true, //this could be a system activity
    },

    /**
     * The client_id of the user that performed the activity
     */
    client_id: {
        type: DataTypes.STRING,
        allowNull: false
    },

    /**
     * The type of activity that took place, i.e. auth, etc...
     */
    type: DataTypes.STRING,

    /**
     * Data associated with the activity. will vary based on the activity type
     */
    data: DataTypes.JSONB,

    /**
     * Indicates whether this activity accessed PHI
     */
    phi: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },

    /**
     * If the activity was PHI related, and targeted a single patient, this is the URI for the patient that was 
     * accessed.
     */
    patient_resource: {
        type: DataTypes.STRING(500),
    }

}

/**
 * @type {typeof import('sequelize').Model}
 */
class Activity extends Model {

    /**
     * @param {ActivitySchema} activity 
     */
    static async log(activity) {
        await Activity.create(activity);
    }

}

let sequelize = require('../sequelize').get(process.env.CLIENT_DB_URI);

let model_options = {
    sequelize, // We need to pass the connection instance
    modelName: 'Activity', // We need to choose the model name
    tableName: 'activity',
    createdAt: 'create_date',
    updatedAt: 'update_date',
    indexes: [
        {fields: ['user_id']},
        {fields: ['create_date']}

    ]
}

Activity.init(schema, model_options);
module.exports = Activity;