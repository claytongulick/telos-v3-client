let passport = require('passport');

module.exports = {
    test: function(req) {
        if(req.path.startsWith('/admin'))
            return true;
        return false;
    },
    handle: async function(req, res, next) {
    }
}