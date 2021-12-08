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
const ObjectId = require('mongoose').Types.ObjectId;

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
     * Verify that the requesting user is the profile owner. Also enhance the request object with the profile.
     * @param {*} req 
     * @param {*} res 
     * @param {*} next 
     */
    static authorizeProfileOwner() {
        return async (req, res, next) => {
            let profile_id = req.params.profile_id;
            
            try {
                let profile = await Profile.findById(profile_id);
                let is_owner = await profile.isOwner(req.user._id);
                if(!is_owner)
                    return res.status(403).json({status: 'error', message: 'access forbidden'});

                //give the controller hydrated objects
                req.profile = profile;
            }
            catch(err) {
                res.status(500).json({status: 'error', message: err});
                console.error(err);
                return;
            }

            next();
        }
    }

    /**
     * Authorization middleware method for access to a profile.
     * Any route that accesses a profile must go through this middleware.
     * Provides a user and a profile on the req for the controller to use.
     * 
     * Areas of responsibility are separated here for utility throughout the system.
     */
    static authorizeProfileAccess(permission) {
        return async (req, res, next) => {
            let user = req.user;
            let profile_id = req.params.profile_id;
            if(!profile_id)
                return res.status(400).json({status: 'error', message: 'Missing profile id'});

            try {
                let profile = await Profile.findById(profile_id);
                if(!profile)
                    return res.status(404).json({status: 'error', message: 'Profile not found'});

                let has_access = await Authorize.hasAccess(profile, profile, user, permission);
                if(!has_access)
                    return res.status(403).json({status: 'error', message: 'Forbidden'});

                //give the controller hydrated objects
                req.profile = profile;

            }
            catch(err) {
                res.status(500).json({status: 'error', message: err});
                console.error(err);
                next(err);
            }

            next();
        };
    }


    /**
     * Authorization middleware method for access to a project.
     * Any route that edits a project must go through this middleware.
     * Provides a user and an project on the req for the controller to use.
     * 
     * Areas of responsibility are separated here for utility throughout the system.
     */
    static authorizeProjectAccess(permission) {
        return async (req, res, next) => {
            let user = req.user;

            let profile_id = req.params.profile_id;
            if(!profile_id)
                return res.status(400).json({status: 'error', message: 'Missing profile id'});

            let project_id = req.params.project_id;
            if(!project_id)
                return res.status(400).json({status: 'error', message: 'Missing project id'});

            try {
                let profile = await Profile.findById(profile_id);
                if(!profile)
                    return res.status(404).json({status: 'error', message: 'Profile not found'});

                let project = await Project.findById(project_id);
                if(!project)
                    return res.status(404).json({status: 'error', message: 'Project not found'});

                //verify the route params match the block
                if (profile_id !== project.profile.toString())
                    return res.status(400).json({ status: 'error', message: 'Invalid profile id' });

                let has_access = await Authorize.hasAccess(profile, project, user, permission);
                if (!has_access)
                    return res.status(403).json({ status: 'error', message: 'Forbidden' });

                //give the controller hydrated objects
                req.project = project;
                req.profile = profile;

            }
            catch (err) {
                res.status(500).json({ status: 'error', message: err });
                console.error(err);
                return;
            }

            next();
        };
    }


    /**
     * Authorization middleware method for access to edit an article.
     * Any route that edits an article must go through this middleware.
     * Provides a user and an article on the req for the controller to use.
     * 
     * Areas of responsibility are separated here for utility throughout the system.
     */
    static authorizeArticleAccess(permission) {
        return async (req, res, next) => {
            let user = req.user;
            let article_id = req.params.article_id;
            if(!article_id)
                return res.status(400).json({status: 'error', message: 'Missing article id'});

            let profile_id = req.params.profile_id;
            if(!profile_id)
                return res.status(400).json({status: 'error', message: 'Missing profile id'});

            try {
                let profile = await Profile.findById(profile_id);
                if(!profile)
                    return res.status(404).json({status: 'error', message: 'Profile not found'});

                let article = await Article.findById(article_id);
                if(!article)
                    return res.status(404).json({status: 'error', message: 'Article not found'});

                if(profile_id !== article.profile.toString())
                    return res.status(400).json({status: 'error', message: 'Invalid profile id'});

                let has_access = await Authorize.hasAccess(profile, article, user, permission);
                if(!has_access)
                    return res.status(403).json({status: 'error', message: 'Forbidden'});

                //give the controller hydrated objects
                req.article = article;
                req.profile = profile;
            }
            catch(err) {
                res.status(500).json({status: 'error', message: err});
                console.error(err);
                return;
            }

            next();
        };
    }

    /**
     * Authorization middleware method for access to a block.
     * Any route that accesses a block must go through this middleware.
     * Provides a user and a block on the req for the controller to use.
     * 
     * Areas of responsibility are separated here for utility throughout the system.
     */
    static authorizeBlockAccess(permission) {
        return async (req, res, next) => {
            let user = req.user;
            let block_id = req.params.block_id;
            if(!block_id)
                return res.status(400).json({status: 'error', message: 'Missing block id'});

            let article_id = req.params.article_id;
            if(!article_id)
                return res.status(400).json({status: 'error', message: 'Missing article id'});

            let profile_id = req.params.profile_id;
            if(!profile_id)
                return res.status(400).json({status: 'error', message: 'Missing profile id'});
            
            try {
                let profile = await Profile.findById(profile_id);
                if(!profile)
                    return res.status(404).json({status: 'error', message: 'Profile not found'});

                let block = await Block.findById(block_id);
                if(!block)
                    return res.status(404).json({status: 'error', message: 'Block not found'});

                let article = await Article.findById(article_id);
                if(!article)
                    return res.status(404).json({status: 'error', message: 'Article not found'});

                //verify the route params match the block
                if(article_id !== block.article.toString())
                    return res.status(400).json({status: 'error', message: 'Invalid article id'});

                if(profile_id !== block.profile.toString())
                    return res.status(400).json({status: 'error', message: 'Invalid profile id'});

                let has_access = false;;
                //block edit permissions are bit more complex. See below.
                if(permission == ACL.PERMISSION_EDIT) {
                    has_access = await Authorize.canEditBlock(profile, article, block, user);
                }

                if(!has_access)
                    //block uses article permissions
                    has_access = await Authorize.hasAccess(profile, article, user, permission);

                if(!has_access)
                    return res.status(403).json({status: 'error', message: 'Forbidden'});

                //give the controller hydrated objects
                req.block = block;
                req.article = article;
                req.profile = profile;
            }
            catch(err) {
                res.status(500).json({status: 'error', message: err});
                console.error(err);
                return;
            }

            next();
        };
    }

    static authorizeEntityAccess(permission) {
        return async (req, res, next) => {
            let user = req.user;
            let profile_id = req.params.profile_id;
            if(!profile_id)
                return res.status(400).json({status: 'error', message: 'Missing profile id'});

            let entity_id = req.params.entity_id;
            if(!entity_id)
                return res.status(400).json({status: 'error', message: 'Missing entity id'});

            try {
                let profile = await Profile.findById(profile_id);
                if(!profile)
                    return res.status(404).json({status: 'error', message: 'Profile not found'});

                let entity = await Entity.findById(entity_id);
                if(!entity)
                    return res.status(404).json({status: 'error', message: 'Entity not found'});

                if(profile_id !== entity.profile.toString())
                    return res.status(400).json({status: 'error', message: 'Invalid profile id'});

                let article_ids = entity.articles;

                //in order to have a permission on an entity: 
                //  -it must not be hidden (this is checked in hasAccess)
                //  -the user must have the specified permission on at least one article the entity is linked in
                for(let article_id of article_ids) {
                    let article = await Article.findById(article_id,'hidden effectively_hidden locked effectively_locked created_by').lean().exec();
                    if(await Authorize.hasAccess(profile, article, user, permission)) {
                        req.profile = profile;
                        req.entity = entity;
                        return next();
                    }
                }

                //if we didn't make it here, they've failed
                return res.status(403).json({status: 'error', message: 'Forbidden'});
            }
            catch(err) {
                res.status(500).json({status: 'error', message: err});
                console.error(err);
                return next(err);
            }

        }

    }

    /* 
      block permissions are a bit different. They use article, to a degree.
        if the user has 'add' on the article (or scope chain) and they were the ones
        who created the block, then they are allowed to edit it.
    */     
    static async canEditBlock(profile, article, block, user) {
        let has_edit = await Authorize.hasAccess(profile, article, user, ACL.PERMISSION_EDIT);
        if(has_edit)
            return true;

        let has_add = await Authorize.hasAccess(profile, article, user, ACL.PERMISSION_ADD);
        if(has_add)
            if(block.created_by.toString() == user._id.toString())
                return true;

        return false;
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