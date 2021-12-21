const User = require('common/db/models/user');
const Authentication = require('../classes/authentication');

class ControllerPassword {
    auth(req, res, next) {
        let username = req.body.username;
        let password = req.body.password;

        if(!username)
            return res.status(400).json({status: 'error', message:'missing username'});
        if(!password)
            return res.status(400).json({status: 'error', message:'missing password'});

        /** @type User */
        let user = User.findOne({where: {username}, attributes: ['id', 'username', 'roles', 'resource', 'hash', 'salt']});
        Authentication.startAuthFlow(req, user, "password");
        let password_is_valid = await user.checkPassword(password);
        if(!(password_is_valid === true)) {
            return req.status(403).json({status: 'error', message: 'invalid password'});;
        }


    }
}

module.exports = ControllerPassword;