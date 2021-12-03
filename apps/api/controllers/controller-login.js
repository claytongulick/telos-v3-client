/*
 *   Copyright (c) 2020 Ratio Software, LLC 
 *   All rights reserved.
 *   @author Clayton Gulick <clay@ratiosoftware.com>
 */
'use strict';

/**
 controller-login.js

 Handles authentication related routes

 @author Clay Gulick
 @email clay@ratiosoftware.com
**/

const passport = require('passport'),
    Authentication = require('../helpers/helper-authentication'),
    User = require('../models/model-user'),
    config = require('../../env/config'),
    Communication = require('../models/model-communication'),
    CommunicationHelper = require('../helpers/helper-communication')
    ;

class LoginController {

    /**
     * Allow an admin user to get a login link. This will allow the user to emulate a different user, or to manually send a link out.
     * @param {*} req 
     * @param {*} res 
     * @param {*} next 
     */
    static async getLoginLink(req, res, next) {
        let user_id = req.params.user_id;
        let user = await User.findOne({_id: user_id}).exec();
        if(!user)
            return res.status(404).json('unknown user');

        let path = '/app';
        let nonce = await Authentication.createLoginNonce(user._id, {created_by: req.user._id, reason: "Created from admin request"});
        const nonce_url = `${config.base_url}${path}?token=${nonce.nonce}`;
        res.json({url: nonce_url});
    }

    /**
     * This sends a login nonce communication.
     * Note: though this seems redundant with the existing communication route, it IS NOT
     * The reason is that this does not allow the client to control the template etc... for the sent communication,
     * where the communication routes do allow this for admin users. This is an UNAUTHENTICATED route!
     * @param {*} req 
     * @param {*} res 
     * @param {*} next 
     */
    static async sendOTP(req, res, next) {
        const type = req.body.type;
        let to = {reference: null, reference_type: 'User', to_address: null};
        let template;
        let user;
        let user_id = req.body.user_id;
        let username = req.body.username;
        let email_address = req.body.email_address;

        if(user_id)
            user = await User.findOne({_id: user_id},'_id email_address phone_cell').lean();
        else if(username)
            user = await User.findOne({username: username},'_id email_address phone_cell').lean();
        else if(email_address)
            user = await User.findOne({email_address: email_address},'_id email_address phone_cell').lean();

        if(!user)
            return res.status(400).json({status: 'error', message: 'Invalid user identifier'});

        let otp = await Authentication.setOTP(user._id);

        if(!(['sms','email'].includes(type)))
            res.status(400).json({status: 'error', message: 'Invalid type'});

        if(type === 'sms') {
            to.to_address = user.phone_cell;
            template = '/communication/login-otp-sms';
        }
        else if(type === 'email') {
            to.to_address = user.email_address;
            template = '/communication/login-otp-email';
        }
        else
            throw new Error("Unsupported communication type:" + type);

        to.reference = user._id;
        let communication = new Communication({
            to: [to],
            communication_type: type,
            communication_template: template,
            fields: {
                subject: 'Your Kith & Kin login code',
                from_address: 'hello@kithandkin.app',
                code: otp.code.toUpperCase(),
                url: process.env.NODE_ENV == 'production' ? 'my.kithandkin.app' : 'kithandkin.ratiosoftware.com'
            }
        });
        await communication.save();

        await CommunicationHelper.sendCommunication(communication._id);

        res.json({status: 'ok'});
    }

    /**
     * This sends a login nonce communication.
     * Note: though this seems redundant with the existing communication route, it IS NOT
     * The reason is that this does not allow the client to control the template etc... for the sent communication,
     * where the communication routes do allow this for admin users. This is an UNAUTHENTICATED route!
     * @param {*} req 
     * @param {*} res 
     * @param {*} next 
     */
    static async sendNonceLink(req, res, next) {
        const type = req.body.type;
        let to = {reference: null, reference_type: 'User', to_address: null};
        let template;
        let user;
        let user_id = req.params.user_id;

        if(user_id)
            user = await User.findById(user_id);

        if(!(['sms','email'].includes(type)))
            res.status(400).json({status: 'error', message: 'Invalid type'});

        if(type === 'sms') {
            if(user) {
                to.to_address = user.phone_cell;
            }
            else {
                let phone_number = req.body.phone;
                phone_number = phone_number.replace(/[^\d]/g, '');

                if ((phone_number.length > 11) || (phone_number.length < 10))
                    res.status(400).json({ status: 'error', message: 'Invalid phone number' });

                //if this is more than 10 digits and the first number is 1, strip it
                if ((phone_number.length === 11) && (phone_number[0] === '1'))
                    phone_number = phone_number.substring(1);

                if (phone_number.length !== 10)
                    res.status(400).json({ status: 'error', message: 'Invalid phone number' });

                user = await User.findOne({phone_cell: phone_number}).exec();
                if(!user)
                    res.status(400).json({ status: 'error', message: 'Invalid phone number' });

                to.to_address = user.phone_cell;
            }
            template = '/communication/login-sms';
        }
        else if(type === 'email') {
            if(user) {
                to.to_address = user.email_address;
            }
            else {
                let email_address = req.body.email_address;
                user = await User.findOne({email_address: email_address}).exec();
                if(!user)
                    return utility.writeError('Invalid phone number', res);

                to.to_address = user.email_address;
            }
            template = '/communication/login-email';
        }
        else
            throw new Error("Unsupported communication type:" + type);

        if (!user)
            throw new Error('Invalid user');

        /* we're not going to support deep linking on login for this app
        let path = req.body.path;
        let hash = req.body.hash;
        */
       let path='/app';
       let hash='';

        //sanitize the path
        path = path.replace(/[^a-z0-9\/_-]/gi, '_').toLowerCase();
        hash = hash.replace(/[^a-z0-9\/_#-]/gi, '_').toLowerCase();

        let nonce = await Authentication.createLoginNonce(user._id);
        const nonce_url = `${config.base_url}${path}?token=${nonce.nonce}${hash}`;

        to.reference = user._id;
        let communication = new Communication({
            to: [to],
            communication_type: type,
            communication_template: template,
            fields: {
                link: nonce_url
            }
        });
        await communication.save();

        await CommunicationHelper.sendCommunication(communication._id);

        res.json({status: 'ok'});
    }

    /**
     * Simple password based auth. Required for admins.
     * 
     * @param {*} req 
     * @param {*} res 
     * @param {*} next 
     */
    static loginWithPassword(req, res, next) {
        passport.authenticate('local',
            { session: false },
            async (err, user, info) => {
                if(err)
                    return next(err);
                if(!user)   
                    return res.json({status: 'error', message: info});
                const jwt = await Authentication.createJWT({
                    sub: user.id
                });
                res.json({jwt: jwt});
            })(req, res, next);
    }

    /**
     * Single use token based auth. Lower security, acceptable for low privilege users
     * 
     * @param {*} req 
     * @param {*} res 
     */
    static loginWithNonce(req, res, next) {
        passport.authenticate('nonce',
            {session: false},
            (err, jwt) => {
                if(err)
                    return next(err);
                if (!jwt)
                    return res.status(403).json({status: 'error', message: 'invalid nonce'});
                res.json({jwt:jwt});
            })(req, res, next);
    }

    /**
     * Log in with with a one time password that was sent via sms or text
     * @param {*} req 
     * @param {*} res 
     * @param {*} next 
     */
    static loginWithOTP(req, res, next) {
        passport.authenticate('otp',
            {session: false},
            (err, jwt) => {
                if(err)
                    return next(err);
                if (!jwt)
                    return res.status(403).json({status: 'error', message: 'invalid otp'});
                res.json({jwt:jwt});
            })(req, res, next);
    }

    static whoAmI(req, res) {
        if(req.user)
            return res.json({uid: req.user._id});

        res.json({uid: null});
    }


}

module.exports = LoginController;