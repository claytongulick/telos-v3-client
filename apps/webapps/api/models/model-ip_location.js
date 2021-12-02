/*
 *   Copyright (c) 2021 Ratio Software, LLC 
 *   All rights reserved.
 *   @author Clayton Gulick <clay@ratiosoftware.com>
 */

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

/**
 * Data record for straight import of ip location database from https://db-ip.com
 */
let IPLocationSchema = new Schema(
    {
        /**
         * First IP address in the block
         */
        ip_start: String,

        /**
         * Integer representation of ip address used for fast search
         */
        ip_start_integer: Number,

        /**
         * Last IP address in the block
         */
        ip_end: String,

        /**
         * Integer representation of ip address used for fast search
         */
        ip_end_integer: Number,

        /**
         * Two-letter continent code [AF: String, AS, EU, NA, OC, SA, AN]
         */
        continent: String,

        /**
         * ISO 3166-1 alpha-2 country code
         */
        country: String,

        /**
         * State or Province name
         */
        stateprov: String,

        /**
         * City name
         */
        city: String,

        /**
         * Decimal latitude
         */
        latitude: Number,

        /**
         * Decimal longitude
         */
        longitude: Number
    },
    {
        collection: 'ip_location',
        timestamps: { createdAt: 'created_date', updatedAt: 'updated_date' }
    });


let IPLocation = mongoose.model('IPLocation', IPLocationSchema);
module.exports = IPLocation;