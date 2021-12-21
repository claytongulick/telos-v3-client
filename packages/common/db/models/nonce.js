const { DataTypes, Model } = require('sequelize');

/**
 * @interface NonceSchema
 */
let schema = {
    /**
     * The unique id for the activity
     * @memberof NonceSchema
     */
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },

    /**
     * The cryptographically generated token used for the nonce
     * @memberof NonceSchema
     * @instance
     * @type {string}
     */
    token: {
        type: DataTypes.STRING,
        allowNull: false
    },

    /**
     * Indicates whether this is a one-time link
     * @memberof NonceSchema
     * @instance
     * @type {boolean}
     */
    single_use: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    },

    /**
     * Date that the nonce expires. If single_use is false, the nonce can be reused until the expires_date.
     * @memberof NonceSchema
     * @instance
     * @type {Date}
     */
    expires_date: {
        type: DataTypes.DATE,
        defaultValue: () => { return new Date(Date.now() + (1000 * 60 * 60 * 24)) }
    },

    /**
     * Indicated whether the nonce has been consumed
     * @memberof NonceSchema
     * @instance
     * @type {boolean}
     */
    is_consumed: DataTypes.BOOLEAN,

    /**
     * The date the nonce was used
     * @memberof NonceSchema
     * @instance
     * @type {Date}
     */
    consumed_date: DataTypes.BOOLEAN,

    /**
     * Data to associate with the nonce being consumed. For login tokens, this will contain thing like the IP address
     * of the consumer, as well as user agent and other relevant data
     * @memberof NonceSchema
     * @instance
     * @type {Object}
     */
    consumed_data: DataTypes.JSONB,

    /**
     * Indicated whether the nonce is valid. This allows a nonce to be invalidated prior to consumption
     * @memberof NonceSchema
     * @instance
     * @type Boolean
     */
    is_valid: DataTypes.BOOLEAN,

    /**
     * Data to associate with the nonce. For login tokens, this will be the data stored in the JWT
     * @memberof NonceSchema
     * @instance
     * @type {Object}
     */
    data: DataTypes.JSONB,
}

/**
 * @implements {NonceSchema}
 */
class Nonce extends Model {

}

let sequelize = require('../sequelize').get(process.env.CLIENT_DB_URI);

let model_options = {
    sequelize, // We need to pass the connection instance
    modelName: 'nonce', // We need to choose the model name
    createdAt: 'create_date',
    updatedAt: 'update_date',
    indexes: [
        { fields: ['token'] },
        { fields: ['create_date'] }

    ]
}

Nonce.init(schema, model_options);
module.exports = Nonce;