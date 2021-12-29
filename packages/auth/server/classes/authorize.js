/*
 *   Copyright (c) 2020 Ratio Software, LLC 
 *   All rights reserved.
 *   @author Clayton Gulick <clay@ratiosoftware.com>
 */
const passport = require('passport') ;
const Project = require('../models/model-project');
const Profile = require('../models/model-profile');
const Article = require('../models/model-article');
const Block = require('../models/model-block');
const Entity = require('../models/model-entity');
const ACL = require('../helpers/helper-acl');

class Authorize {

    static authenticateJWT() {
        //this returns express middleware fn(req, res, next)
        return (req, res, next) => {
            passport.authenticate('jwt', 
                {session: false},
                async (err, user, info) => {
                    try {
                        if(err)
                            return next(err);
                        if(!user)
                            return res.status(401).json({
                                status: 'error',
                                message: 'Bad or missing auth token'
                            });

                        //put the user on the request
                        req.user = user;
                        return next();
                    }
                    catch(err) {
                        console.error(err);
                        next(err);
                    }
                }
            )(req, res, next);
        }
    }

    static allowUnauthenticated() {
        //this returns express middleware fn(req, res, next)
        return (req, res, next) => {
            passport.authenticate('jwt', 
                {session: false},
                async (err, user, info) => {
                    try {
                        if(err)
                            return next(err);
                        if(!user)
                            return next(); 

                        //put the user on the request
                        req.user = user;
                        return next();
                    }
                    catch(err) {
                        console.error(err);
                        next(err);
                    }
                }
            )(req, res, next);
        }

    }

    /**
     * Utility method to determine if the requestor has access to the requested permission.
     * This takes into account hidden and locked status.
     * 
     * @param {*} profile  //mongoose object
     * @param {*} target //mongoose object
     * @param {*} user //mongoose object
     * @param {*} permission 
     */
    static async hasAccess(profile, target, user, permission) {
        let acl = new ACL(profile.acl);
        let is_owner = await profile.isOwner(user._id);
        if(is_owner)
            return true;

        let hidden;
        let locked;

        if(target.effectively_hidden)
            hidden = !!target.effectively_hidden.hidden;
        else //at the project level, there's no effectively_hidden
            hidden = !!target.hidden;

        if(hidden)
            return false; //no one but owner and admin see hidden

        if(target.effectively_hidden)
            locked = target.effectively_locked.locked
        else
            locked = target.locked;

        if(locked && (permission >= ACL.PERMISSION_EDIT))
            return false; //can't edit a locked thing
        
        //edit is tricky. we can't just check for edit,
        //we also need to check to see if they have 'add' and if 
        //they are the creator. In this case, they are allowed to edit
        if(permission == ACL.PERMISSION_EDIT) {
            //first, just check if they can edit.
            if(acl.hasAccess(target._id, user._id, ACL.PERMISSION_EDIT))
                return true;

            //if not, see if they have 'add' in the scope chain
            if(acl.hasAccess(target._id, user._id, ACL.PERMISSION_ADD))
                if(target.created_by.toString() == user._id.toString())
                    return true;
            return false;
        }

        return acl.hasAccess(target._id, user._id, permission);
    }

    /**
     * Verify the user's privileges match the specified role
     * 
     * @param {*} role 
     */
    static hasRole(allowed_roles) {
        if((typeof allowed_roles) == 'string')
            allowed_roles = [allowed_roles];

        return (req, res, next) => {
            let user = req.user;
            //allow any authenticated role
            if(allowed_roles.includes('*')) {
                if(user) {
                    req.user = user;
                    return next();
                }
            }

            //admins pass all checks
            if(user.role_name == 'admin') {
                req.user = user;
                return next();
            }

            //if the 'self' role is passed in, it means that the permission is only valid for a user
            //accessing their own data
            if(allowed_roles.includes('self')) {
                let requested_user_id = req.params.user_id;
                if(user._id.toString() !== requested_user_id) 
                    return res.status(403).json({
                        status: 'error',
                        message: 'Insufficient priviliges'
                    });
                req.user = user;
                return next();
            }


            //ensure the user role 
            if(!(allowed_roles.includes(user.role_name)))
                return res.status(403).json({
                    status: 'error',
                    message: 'Unauthorized access'
                });

            req.user = user;
            next();
        }
    }

}

module.exports = Authorize;