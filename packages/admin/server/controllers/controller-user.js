/*
 *   Copyright (c) 2020 Ratio Software, LLC 
 *   All rights reserved.
 *   @author Clayton Gulick <clay@ratiosoftware.com>
 */
const User = require('common/db/models/user');
const aqp = require('api-query-params');
const JSONPatchRules = require('json-patch-rules');

class UserController {

    static async getUser(req, res, next) {
        const user_id = req.params.user_id;
        const user = await User.findOne({where: {id: user_id}});
        if(!user) 
            return res.status(404).json({status: 'error', message: 'user not found'})

        res.json(user);
    }

    static async getUsers(req, res, next) {
        let query = aqp(req.query);
        const { where, offset, limit, order, attributes} = query;
        //this is an admin-inly query so we don't sanitize this
        let users = await User.findAll(query);
        res.json(users);
    }

    static async createUser(req, res, next) {
        let user_dto = req.body;
        let new_user = await User.create(user_dto);

        if(req.body.password)
            await new_user.setPassword(req.body.password);

        res.json(new_user.clean());
    }

    static async patchUser(req, res, next) {
        let user = req.user;
        let rules_mode = 'whitelist';
        let rules = [
            {path: '/first_name'},
            {path: '/last_name'},
            {path: '/email_address'},
            {path: '/avatar'},
            {path: '/phone'},
            {path: '/password', op: 'replace'}
        ];

        let patch = req.body;
        let user_id = req.params.user_id;
        let patch_user = await User.findOne({where: {id: user_id}});

        if(!patch_user)
            return res.status(404).json({status: 'error', message: 'user not found'});

        if(user.role_name == 'admin') {
            rules = [{path: '/id'}, {path: '/id'}];
            rules_mode = 'blacklist';
        }

        try {
            await patch_user.jsonPatch(patch,
                {
                    rules: rules,
                    rules_mode: rules_mode,
                    middleware: [
                        {
                            op: 'replace', path: '/password', handler:
                                async (document, item, next) => {
                                    await patch_user.setPassword(item.value);
                                }
                        },
                    ],
                    autosave: true
                });
        }
        catch(err) {
            return res.status(418).json(err);
        }

        res.json(patch_user.clean());
    }
}

module.exports = UserController;