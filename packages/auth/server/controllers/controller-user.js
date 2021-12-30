const User = require('common/db/models/user');
const aqp = require('api-query-params');

class UserController {

    static async getBasicUser(req, res, next) {
        const email_address = req.params.email_address;
        const user = await User.findOne({where: {email_address}, attributes: ['id','avatar','first_name']});
        if(!user) 
            return res.status(404).json({status: 'error', message: 'user not found'})

        res.json(user);
    }

    static async whoAmI(req, res, next) {
        res.json(req.session.user);
    }
}

module.exports = UserController;