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
    channel_name: {
        type: DataTypes.STRING(500),
        allowNull: false,
        unique: true
    }, 

    /**
     * The date/time of the last received message.
     * Used for fast polling for messages in the channel
     */
    last_message_date: DataTypes.DATE

}

/**
 * @type {typeof import('sequelize').Model}
 */
class NotificationChannel extends Model {

}

let sequelize = require('../sequelize').get(process.env.CLIENT_DB_URI);

let model_options = {
    sequelize, // We need to pass the connection instance
    modelName: 'notification_channel', // We need to choose the model name
    createdAt: 'create_date',
    updatedAt: 'update_date',
    indexes: [
        {fields: ['last_message_date']},
    ]
}

NotificationChannel.init(schema, model_options);
module.exports = NotificationChannel;