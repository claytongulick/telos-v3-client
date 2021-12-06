/*
 *   Copyright (c) 2020 Ratio Software, LLC 
 *   All rights reserved.
 *   @author Clayton Gulick <clay@ratiosoftware.com>
 */
let mongoose = require('mongoose'),
    Schema = mongoose.Schema;

/**
 * Represents a token created for a single use. Tracks when the token is used, invalidated and data associated with
 * the token
 *
 * @constructs None
 * @type {mongoose.Schema}
 * @param {Object} [model_definition] - The information used to define a new instance of Nonce
 */
let NonceSchema = new Schema({
    /**
     * The token for the nonce
     * @memberof Nonce
     * @instance
     * @type String
     */
    nonce: {
        type: String,
        index: true
    },

    /**
     * The date of creation
     * @memberof Nonce
     * @instance
     * @type Date
     */
    create_date: Date,

    /**
     * Indicates whether this is a one-time link
     */
    single_use: {
        type: Boolean,
        default: false
    },

    /**
     * Date that the nonce expires. If single_use is false, the nonce can be reused until the expires_date.
     */
    expires_date: {
        type: Date,
        default: () => {return new Date(Date.now() + (1000 * 60 * 60 * 24))}
    },

    /**
     * Indicated whether the nonce has been consumed
     * @memberof Nonce
     * @instance
     * @type Boolean
     */
    is_consumed: Boolean,

    /**
     * The date the nonce was used
     * @memberof Nonce
     * @instance
     * @type Date
     */
    consumed_date: Date,

    /**
     * Data to associate with the nonce being consumed. For login tokens, this will contain thing like the IP address
     * of the consumer, as well as user agent and other relevant data
     * @memberof Nonce
     * @instance
     * @type Mixed
     */
    consumed_data: Schema.Types.Mixed,

    /**
     * History of attempts to use the nonce
     */
    access_log: [
        {
            date: Date,
            success: Boolean,
            data: Schema.Types.Mixed,
            reason: String
        }
    ],

    /**
     * Indicated whether the nonce is valid. This allows a nonce to be invalidated prior to consumption
     * @memberof Nonce
     * @instance
     * @type Boolean
     */
    is_valid: Boolean,

    /**
     * Data to associate with the nonce. For login tokens, this will be the data stored in the JWT
     * @memberof Nonce
     * @instance
     * @type Mixed
     */
    data: Schema.Types.Mixed,

}, {
    collection: 'nonce',
    timestamps: { createdAt: 'created_date', updatedAt: 'updated_date' }
});

module.exports = mongoose.model('Nonce', NonceSchema);