let passport = require('passport');

module.exports = {
    test: function (req) {
        if (req.path.startsWith('/admin'))
            return true;
        return false;
    },
    handle: async function (req, res, next) {
        //for API requests, if the session is missing, return a 403
        if(req.url.startsWith('/admin/api')) {
            if (!req?.session?.user)
                return res.status(403).json({ status: 'error', message: 'Missing or invalid session' });
        }
        //for browser UI requests in general, redirect over to auth if missing user
        if (!req?.session?.user)
            return res.redirect(`/auth?redirect_url=${encodeURI(req.url)}`);
        let organization = user.organization;
        let role = user.role;
        if (
            (organization == process.env.CLIENT_ID) &&
            (role == 'admin')
        ) {
            logger.debug(`Proxying request for ${req.path} to ${process.env.ADMIN_HOST}:${process.env.ADMIN_HTTP_PORT}`);
            proxy.web(req, res, {
                target: `${process.env.ADMIN_HOST}:${process.env.ADMIN_HTTP_PORT}`,
                headers: {
                    'REMOTE_USER': user.username
                }
            });
        }
    }
}