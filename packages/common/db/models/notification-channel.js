const { DataTypes, Model } = require('sequelize');
/**
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
     * The name of the notification channel
     */
    channel_name: DataTypes.STRING(500),

    /**
     * The date/time of the last received message.
     * Used for fast polling for messages in the channel
     */
    last_message_date: DataTypes.DATE


}

/**
 * @type {typeof import('sequelize').Model}
 */
class Activity extends Model {

}

let sequelize = require('../sequelize').get(process.env.CLIENT_DB_URI);

let model_options = {
    sequelize, // We need to pass the connection instance
    modelName: 'activity', // We need to choose the model name
    createdAt: 'create_date',
    updatedAt: 'update_date',
    indexes: [
        {fields: ['user_id']},
        {fields: ['create_date']}

    ]
}

Activity.init(schema, model_options);
module.exports = Activity;