/*
 *   Copyright (c) 2020 Ratio Software, LLC 
 *   All rights reserved.
 *   @author Clayton Gulick <clay@ratiosoftware.com>
 */
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const config = require('../../env/config');
const slugify = require('slugify');
const util = require('util');
const fs = require('fs');

const jsonPatchPlugin = require('mongoose-patcher');

/**
 * This represents a client of Telos.
 * 
 * A client is defined as an entity that has patients that may be serviced by themselves, Telos, or another client.
 */
let ClientSchema = new Schema(
    {
        /**
         * Human readable name for the client, i.e. Home Health of Virginia
         */
        name: String,

        /**
         * System name for the client appropriate for use as DNS subdomain.
         * This will be used as <client_id>.teloshs.com
         */
        client_id: String,

        /**
         * Current status for the client
         */
        status: {
            type: String,
            enum: ['active','inactive','delinquent']
        },

        /**
         * The location of the git mono-repo for the client
         */
        code_repository: String,

        /**
         * Environments where the client's code is deployed
         */
        environments: [
            {
                /**
                 * What type of environment, production, stage, etc...
                 */
                environment: {
                    type: String,
                    enum: [
                        /**
                         * Production deployment that includes PHI
                         */
                        'production', 

                        /**
                         * Pre-production environment for verifying a deployment
                         */
                        'stage', 

                        /**
                         * A test environment used for testing various features or code branches
                         */
                        'test'
                    ]
                },

                /**
                 * The code branch to use for the environment
                 */
                code_branch: String,

                status: {
                    type: String,
                    enum: ['new', 'provisioning','provisioned','deleting','deleted'],
                    default: 'new',
                },

                status_history: [
                    {
                        old_status: String,
                        new_status: String,
                        date: Date
                    }
                ],

                log: [{
                    date: Date,
                    message: String
                }]
            }
        ],

    },
    {
        collection: 'client',
        timestamps: { createdAt: 'created_date', updatedAt: 'updated_date' }
    });

//enable the json-patch magic
ClientSchema.plugin(jsonPatchPlugin);

let ClientModel = mongoose.model('Client', ClientSchema);
module.exports = ClientModel;