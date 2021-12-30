/*
 *   Copyright (c) 2020 Ratio Software, LLC 
 *   All rights reserved.
 *   @author Clayton Gulick <clay@ratiosoftware.com>
 */
'use strict';

let uuid = require('uuid').v4;
let Encryption = require('common/server/encryption');
let SMS = require('common/server/sms');
let User = require('common/db/models/user');
let config = require('../../config/config');
let util = require('util');
const Activity = require('common/db/models/activity');

/**
 * Utility class for user authentication
 * 
 * @typedef {Object} AuthSession the session object describing the authentication status and the user
 * @property {string} flow The authentication flow used to authenticate the session
 * @property {string} status The current step in the authentication flow
 * @property {boolean} trusted Whether the session has been fully authenticated and all steps completed
 * @property {string} client_id The client id for the authenticated user
 * @property {Date} session_start_date The date/time when the session was started
 * @property {Date} session_trusted_date The date/time when the authentication was completed and the session was upgraded to "trusted"
 * @property {Object} user The authenticated user
 * @property {Number} user.id The user id
 * @property {string} user.username The unique username for the user
 * @property {string} user.resource The FHIR resource, if any, for the user
 * @property {Array} user.roles The list of roles the user has, i.e. 'admin','practitioner','patient', etc...
 */
class Authentication {

    static async startAuthFlow(req, user, flow, data) {
        /** @property {AuthSession} session */
        let session = req.session;
        session.client_id = process.env.CLIENT_ID;
        session.flow = flow;
        session.session_start_date = new Date();
        session.session_trusted_date = new Date();
        session.status = "started";
        session.trusted = false;
        session.user = {};
        session.user.id = user.id;
        session.user.resource = user.resource;
        session.user.roles = user.roles;
        session.user.username = user.username;
        await Activity.create({
            type: 'auth',
            user_id: user.id,
            client_id: session.client_id,
            data: {
                step: "start",
                flow,
                headers: req.headers,
                ...data
            }
        })
    }

    static async failAuthFlow(req, user, flow, reason, data) {
        /** @type AuthSession */
        let session = req.session;

        if(flow !== session.flow)
            throw new Error("Invalid flow");

        if(user.id !== session.user.id)
            throw new Error("Invalid user");

        let destroySession = util.promisify(session.destroy).bind(session);
        await destroySession();
        await Activity.create({
            type: 'auth',
            user_id: user.id,
            client_id: session.client_id,
            data: {
                step: "fail",
                flow,
                reason,
                headers: req.headers,
                ...data
            }
        });

    }

    static async completeAuthFlowStep(req, user, flow, step, data) {
        /** @type AuthSession */
        let session = req.session;

        if(flow !== session.flow)
            throw new Error("Invalid flow");

        if(user.id !== session.user.id)
            throw new Error("Invalid user");

        session.status = step;
        session.trusted = false;

        await Activity.create({
            type: 'auth',
            user_id: user.id,
            client_id: session.client_id,
            data: {
                step,
                flow,
                headers: req.headers,
                ...data
            }
        });
    }

    static async completeAuthFlow(req, user, flow, data) {
        /** @type AuthSession */
        let session = req.session;

        if(flow !== session.flow)
            throw new Error("Invalid flow");

        if(user.id !== session.user.id)
            throw new Error("Invalid user");

        session.status = "complete";
        session.trusted = true;
        session.session_trusted_date = new Date();

        await Activity.create({
            type: 'auth',
            user_id: user.id,
            client_id: session.client_id,
            data: {
                step: "complete",
                flow,
                headers: req.headers,
                ...data
            }
        });

    }

}

module.exports = Authentication;