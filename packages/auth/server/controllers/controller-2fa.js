const Authentication = require("../classes/authentication");

class Controller2FA {
    static async authPassword(req, res, next) {
        let username = req.body.username;
        let password = req.body.password;

        if(!username)
            return res.status(400).json({status: 'error', message:'missing username'});
        if(!password)
            return res.status(400).json({status: 'error', message:'missing password'});

        /** @type User */
        let user = User.findOne({where: {username}, attributes: ['id', 'username', 'roles', 'resource', 'hash', 'salt']});
        await Authentication.startAuthFlow(req, user, "2fa");
        let password_is_valid = await user.checkPassword(password);
        if(!(password_is_valid === true)) {
            await Authentication.failAuthFlow(req, user, '2fa', 'invalid password');
            return req.status(403).json({status: 'error', message: 'invalid password'});;
        }
        await Authentication.completeAuthFlowStep(req, user, '2fa', 'password');
        await OTP.setOTP(user.id);
        await OTP.send()
        res.status(200).json({status: 'ok'});

    }

    static async authOTP(req, res, next) {

    }

}