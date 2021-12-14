const { DataTypes, Model } = require('sequelize');

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
        type: DataTypes.STRING,
    },

    /**
     * What type of setting value
     */
    type: {
        type: DataTypes.STRING,
        allowNull: false,
        validator: {
            isIn: {
                args: [['string','number','boolean','date','json']],
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
    value_json: {
        type: DataTypes.JSONB,
    },

    /**
     * The username of the user who set the value
     */
    set_by: DataTypes.STRING
}


class User extends Model {

}

module.exports = (sequelize) => {
    let model_options = {
        sequelize, // We need to pass the connection instance
        modelName: 'setting', // We need to choose the model name
        createdAt: 'create_date',
        updatedAt: 'update_date'
    }

    User.init(schema, model_options);
    return User;
}