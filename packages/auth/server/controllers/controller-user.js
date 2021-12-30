const User = require('common/db/models/user');
const aqp = require('api-query-params');

class UserController {

    static async getUser(req, res, next) {
        const user_id = req.params.user_id;
        const user = await User.findOne({where: {id: user_id}});
        if(!user) 
            return res.status(404).json({status: 'error', message: 'user not found'})

        res.json(user);
    }

    static async whoAmI(req, res, next) {
        res.json(req.session.user);
    }
}

module.exports = UserController;