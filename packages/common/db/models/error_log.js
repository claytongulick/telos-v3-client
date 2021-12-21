const { DataTypes, Model } = require('sequelize');
/**
 * @interface ErrorLogSchema
 */
let schema = {
    /**
     * The unique id for the error
     */
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },

    /**
     * The type of error that took place
     */
    error_type: DataTypes.STRING,

    /**
     * Message associated with the error, if any
     */
    message: DataTypes.TEXT,

    /**
     * If a runtime error, this includes the stack trace
     */
    stack_trace: DataTypes.TEXT,

    /**
     * The application where the error took place, "auth-server","auth-client","fhir-server","admin-client","admin-server",etc..
     */
    application: DataTypes.STRING,

    /**
     * Data associated with the error. will vary based on the error type
     */
    data: DataTypes.JSONB,

    /**
     * Indicates the severity of the error, 1-4
     * 1 - Critical error, a crucial error that represents a need for immediate attention from support staff and others
     * 2 - Severe error, an error that represents a need for attention from support staff
     * 3 - Unexpected error, an error that was not expected but doesn't affect system performance or operation
     * 4 - Expected error, an error that occurs commonly and is an expected error condition. Logged for information purposes
     */
    severity: DataTypes.INTEGER,

    /**
     * Indicates that any notification subscribers have been sent notifications
     */
    notifications_processed: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    }

}

/**
 * @type {typeof import('sequelize').Model}
 */
class ErrorLog extends Model {

}

let sequelize = require('../sequelize').get(process.env.CLIENT_DB_URI);

let model_options = {
    sequelize, // We need to pass the connection instance
    modelName: 'error_log', // We need to choose the model name
    createdAt: 'create_date',
    updatedAt: 'update_date',
    indexes: [
        {fields: ['create_date']}
    ]
}

ErrorLog.init(schema, model_options);
module.exports = ErrorLog;