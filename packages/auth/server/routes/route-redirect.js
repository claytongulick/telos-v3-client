const RedirectController = require('../controllers/controller-redirect');
const Util = require('common/server/util');

module.exports = (router) => {
    router.route('redirect')
        .get(
            Util.wrap(RedirectController.redirect)
        )
}