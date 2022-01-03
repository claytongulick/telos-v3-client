const User = require('common/db/models/user');
const Authentication = require('../classes/authentication');

class ControllerPassword {
    static async loginWithPassword(req, res, next) {
        let username = req.body.username;
        let password = req.body.password;

        if(!username)
            return res.status(400).json({status: 'error', message:'missing username'});
        if(!password)
            return res.status(400).json({status: 'error', message:'missing password'});

        /** @type User */
        let user = await User.findOne({where: {username}, attributes: ['id', 'username', 'roles', 'resource', 'hash', 'salt']});
        await Authentication.startAuthFlow(req, user, "password");
        let password_is_valid = await user.checkPassword(password);
        if(!(password_is_valid === true)) {
            await Authentication.failAuthFlow(req, user, 'password', 'invalid password');
            return res.status(403).json({status: 'error', message: 'invalid password'});;
        }

        await Authentication.completeAuthFlow(req, user, 'password');
        res.json({status: 'ok'});
    }
}

module.exports = ControllerPassword;