const { DataTypes, Model } = require('sequelize');
const short = require('short-uuid');
const translator = short(); // Defaults to flickrBase58
const Activity = require('./activity');

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
        allowNull: false,
        unique: true
    },

    /**
     * The user id the nonce is created for
     */
    user_id: {
        type: DataTypes.UUID,
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
    is_consumed: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },

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

    /**
     * Create a nonce for the given user id that can be used later to issue a JWT
     * @param user_id
     * @returns {Promise.<void>}
     */
    static async createLoginNonce(user_id, data) {
        let user = await User.findOne({where: {id: user_id } });
        if (!user)
            throw new Error('Invalid user id');

        if (user.account_status !== 'active')
            throw new Error('User account is ' + user.account_status);

        let token = translator.new(); //generate a shortened valid uuid v4

        let nonce = await Nonce.create({
            token,
            user_id,
            is_consumed: false,
            is_valid: true,
            data: {
                sub: user.username,
                nonce: token,
                ...data
            }
        });

        return nonce;
    }

    /**
     * Consume a nonce and return a JWT
     * @param nonce
     * @param headers
     * @returns {Promise.<boolean>}
     */
    static async consumeNonce(token, headers) {
        let nonce = await Nonce.findOne({where: { token }});
        return nonce.consume(headers);
    }

    async consume(headers) {
        let allow = true;
        let reason = '';

        if (!this.is_valid) {
            allow = false;
            reason = "is_valid set to false";
        }
        if (this.single_use)
            if (this.is_consumed) {
                allow = false;
                reason = "is_consumed set to true";
            }
        if (this.expires_date < new Date()) {
            allow = false;
            let now = Date.now();
            reason = `expires_date (${nonce.expires_date}) < ${now}`;
        }

        if(!allow) {
            return {success: false, reason}
        }

        this.is_consumed = true;
        this.consumed_date = new Date();
        this.consumed_data = headers;

        await this.save();
    }
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