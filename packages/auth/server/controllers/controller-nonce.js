let Nonce = require('common/db/models/nonce');
const Authentication = require('../classes/authentication');
class ControllerNonce {
    static async auth(req, res, next) {
        let token = req.params.token;
        if(!token)
            return res.status(400).json({status: 'error', message: 'missing token'});

        let nonce = Nonce.findOne({where: {token}});

        let user = User.findOne({where: {id: nonce.user_id}});
        if(!user)
            return res.status(400).json({status: "error", message: 'invalid user'});

        Authentication.startAuthFlow(req, user, 'nonce', {nonce_id: nonce.id, nonce_token: token});
        let {success, reason} = await nonce.consume(req.headers);
        if(!success) {
            await Authentication.failAuthFlow(req, user, 'nonce', reason);
            return res.status(400).json({status: 'error', message: reason});
        }
        await Authentication.completeAuthFlow(req, user, 'nonce', {nonce_id: nonce.id, nonce_token: token});
        res.status(200).json({status: 'ok'});
    }

}

module.exports = ControllerNonce;