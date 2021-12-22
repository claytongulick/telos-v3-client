const { DataTypes, Model } = require('sequelize');

/**
 * @typedef {Object} SettingSchema The schema for a setting row
 * @property {number} id
 * @property {string} name
 * @property {string} title
 * @property {string} help_text
 * @property {string} type
 * @property {string} value_string
 * @property {number} value_number
 * @property {object} value_object
 * @property {Date} value_date
 * @property {boolean} value_boolean
 * @property {string} set_by
 */
let schema = {
    /**
     * The unique id for the setting
     */
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true

    },

    /**
     * The unique setting name
     */
    name: {
        type: DataTypes.STRING,
        unique: true,
        allowNull: false

    },

    /**
     * The label to display in the UI
     */
    title: {
        type: DataTypes.STRING,
        allowNull: false
    },

    /**
     * Help text to show along with the setting in the user interface
     */
    help_text: {
        type: DataTypes.TEXT,
    },

    /**
     * What type of setting value
     */
    type: {
        type: DataTypes.STRING,
        allowNull: false,
        validator: {
            isIn: {
                args: [['string','number','boolean','date','object','file']],
                msg: 'Type must be string or json'
            }
        }
    },

    /**
     * If type is string, this will hold the value
     */
    value_string: DataTypes.STRING,

    /**
     * If type is number, this will hold the value
     */
    value_number: DataTypes.DOUBLE,

    /**
     * If the value is a boolean this will be true/false
     */
    value_boolean: DataTypes.BOOLEAN,

    /**
     * If the type is date, this will hold the value
     */
    value_date: DataTypes.DATE,

    /**
     * If type is json, this will hold the value
     */
    value_object: {
        type: DataTypes.JSONB,
    },

    /**
     * The username of the user who set the value
     */
    set_by: DataTypes.STRING
}


class Setting extends Model {

}

let sequelize = require('../sequelize').get(process.env.CLIENT_DB_URI);
let model_options = {
    sequelize, // We need to pass the connection instance
    modelName: 'Setting', // We need to choose the model name
    tableName: 'setting',
    createdAt: 'create_date',
    updatedAt: 'update_date'
}

Setting.init(schema, model_options);

module.exports = Setting;