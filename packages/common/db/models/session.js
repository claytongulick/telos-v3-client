const { DataTypes, Model } = require('sequelize');
/**
 * @typedef {Object} SessionSchema
 * @property {Date} create_date
 * @property {Date} update_date
 */
let schema = {
    /**
     * Session id
     */
    sid: {
        type: DataTypes.STRING,
        primaryKey: true,
    },

    /**
     * The date the session expires
     */
    expires: DataTypes.DATE,

    /**
     * Session data
     */
    data: DataTypes.TEXT,

    /**
     * The user for the session
     */
    user_id: {
        type: DataTypes.UUID,
        allowNull: true, //this could be a system activity
    },

    /**
     * The client_id for the session
     */
    client_id: {
        type: DataTypes.STRING,
        allowNull: false
    },
}

/**
 * @type {typeof import('sequelize').Model}
 */
class Session extends Model {

}

/**
 * This is a different connection URI from other models
 */
let sequelize = require('../sequelize').get('session');

let model_options = {
    sequelize, // We need to pass the connection instance
    modelName: 'Session', // We need to choose the model name
    tableName: 'session',
    createdAt: 'create_date',
    updatedAt: 'update_date',
    indexes: [
        {fields: ['expires']},
        {fields: ['user_id']},
        {fields: ['client_id']}
    ]
}

Session.init(schema, model_options);
module.exports = Session;