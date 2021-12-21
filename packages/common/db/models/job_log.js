const { DataTypes, Model } = require('sequelize');
/**
 * @interface JobLogSchema
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
     * Name of the job that was run
     */
    job_name: DataTypes.STRING,

    /**
     * How the job was executed, via cron? manually?
     */
    run_type: DataTypes.STRING,

    start_date: DataTypes.DATE,

    complete_date: DataTypes.DATE,

    /**
     * The os user that executed the process
     */
    run_as: DataTypes.STRING,

    /**
     * The os process id
     */
    pid: DataTypes.INTEGER,

    /**
     * The full command line that executed the job
     */
    command: DataTypes.TEXT,

    /**
     * success, failed, etc... job errors will be added to the errors_log and notifications sent
     */
    status: DataTypes.STRING,

    /**
     * Data associated with the job
     */
    data: DataTypes.JSONB,
}

/**
 * @type {typeof import('sequelize').Model}
 */
class JobLog extends Model {
    static async logJobStart(job_name, data) {
        await JobLog.create({
            job_name,


        });
    }

    static async logJobComplete(job_name, data) {

    }

}

let sequelize = require('../sequelize').get(process.env.CLIENT_DB_URI);

let model_options = {
    sequelize, // We need to pass the connection instance
    modelName: 'job_log', // We need to choose the model name
    createdAt: 'create_date',
    updatedAt: 'update_date',
    indexes: [
        {fields: ['create_date']}
    ]
}

JobLog.init(schema, model_options);
module.exports = JobLog;