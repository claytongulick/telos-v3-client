/*
 *   Copyright (c) 2020 Ratio Software, LLC 
 *   All rights reserved.
 *   @author Clayton Gulick <clay@ratiosoftware.com>
 */
const User = require('../models/model-user');
const Profile = require('../models/model-profile');
const aqp = require('api-query-params');

class UserController {

    static async getAvatar(req, res, next) {
        const user_id = req.params.user_id;
        const user = await User.findById({_id: user_id},'profile').exec();
        if(!user) 
            return res.status(404).json({status: 'error', message: 'user not found'});

        let profile_id = user.profile;
        if(!profile_id) 
            return res.status(404).json({status: 'error', message: 'profile not found'});

        if(!ObjectId.isValid(profile_id))
            return res.status(400).json({status: 'error', message: 'bad profile id'});

        [profile, file] = await Promise.all([
            //get the profile path
            Profile.findById(profile_id,'_id path').lean().exec(),
            //only allow avatar file
            File.findOne({ profile: profile_id, public: true, avatar: true }, 'filename preview').lean().exec()
        ]);
        if(!file)
            return res.status(404).json({status: 'error', message: 'unknown file'});

        let file_path;
        if(preview) {
            file_path = `${profile.path}/${file.preview[preview].filename}`
        }
        else {
            file_path = `${profile.path}/${file.filename}`;
        }

        res.sendFile(file_path);
    }

    static async getUser(req, res, next) {
        const user_id = req.params.user_id;
        const user = await User.findOne({_id: user_id}).exec();
        if(!user) 
            return res.status(404).json({status: 'error', message: 'user not found'})

        res.json(user.clean());
    }

    static async getUsers(req, res, next) {
        const { filter, skip, limit, sort, projection } = aqp(req.query);
        let users = await User.find(filter)
            .skip(skip)
            .limit(limit)
            .sort(sort)
            .select(projection)
            .exec();
        users = users.map((user) => user.clean());
        res.json(users);
    }

    static async createUser(req, res, next) {
        let role_name = 'member';
        //admins can create whatever role they want. Members can only create 'member' roles
        if(req.user.role_name == 'admin')
            role_name = req.body.role_name || 'member';

        let user_dto = req.body;
        let profile_info = user_dto.profile;
        delete user_dto.profile;

        let user = {
            username: user_dto.email_address,
            account_status: 'active',
            email_address: user_dto.email_address,
            first_name: user_dto.first_name,
            last_name: user_dto.last_name,
            middle_name: user_dto.middle_name,
            long_name: user_dto.first_name + ' ' + user_dto.last_name,
            phone_cell: user_dto.phone_cell,
            phone_land: user_dto.phone_land,
            avatar: user_dto.avatar,
            user_created_date: new Date(),
            role_name: role_name,
            last_mod_user: req.user._id
        }
        let new_user = new User(user);
        new_user = await new_user.save();

        //create a profile for the user
        //ProfileSchema.statics.createProfile = async function(owner_id, first_name, last_name, birth_date, profile_type) {
        let profile_dto = {
            user: new_user._id,
            profile_type: 'member',
            basic_information: {
                avatar: new_user.avatar,
                first_name: new_user.first_name,
                last_name: new_user.last_name,
                middle_name: new_user.middle_name,
            },
        };
        //catch any other profile data sent up
        Object.assign(profile_dto, profile_info);
        let profile = await Profile.createProfile(new_user._id, profile_dto);

        new_user.profile = profile._id;
        await new_user.save();

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
            {path: '/phone_cell'},
            {path: '/phone_land'},
            {path: '/password', op: 'replace'}
        ];

        let patch = req.body;
        let user_id = req.params.user_id;
        let patch_user = await User.findOne({_id: user_id});

        if(!patch_user)
            return res.status(404).json({status: 'error', message: 'user not found'});

        if(user.role_name == 'admin') {
            rules = [{path: '/_id'}, {path: '/id'}];
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