let ControllerCore = require('../controllers/controller-core');

module.exports = (router) => {
    router.route('/is-alive')
        .get(ControllerCore.isAlive)

}