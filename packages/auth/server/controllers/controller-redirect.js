let sanitizeUrl = require("@braintree/sanitize-url").sanitizeUrl;

class RedirectController {
    /**
     * Safely redirect the user based on a validated redirect_url or a default application based on their role
     * @param {*} req 
     * @param {*} res 
     * @param {*} next 
     * @returns 
     */
    static async redirect(req, res, next) {
        let user = req.session.user;
        if(!user)
            return res.redirect('/auth');
        if(!req.session.trusted)
            return res.redirect('/auth');

        let redirect_url = req.query.redirect_url;
        if(!redirect_url) {
            //if we don't have a redirect, let's try to intelligently guess based on the user role
            /** @type {Array} */
            let roles = user.roles;
            if(roles.includes('admin')) {
                return res.redirect('/admin');
            }
            if(roles.includes('provider')) {
                return res.redirect('/provider');
            }
            if(roles.includes('patient')) {
                return res.redirect('/patient');
            }
        }

        //validate the redirect url
        let sanitized = sanitizeUrl(redirect_url);

        function validateBasePath(base_path) {
            let valid_base_path = ['proxy','admin','auth','patient','provider','superset'];
            return valid_base_path.includes(base_path);
        }

        //if this is a full url, parse it and validate
        if(sanitized.startsWith('http')) {
            let url = new URL(sanitized);
            let parts = url.pathname.split('/');
            let base_path = parts[0];
            //only redirect to a valid app
            if(!(validateBasePath(base_path)))
                return res.status(403).json({status: 'error', message: 'Invalid redirect url'});

            //on a valid host
            let valid_hostname = [process.env.HOSTNAME, process.env.WHITELABEL_HOSTNAME];
            if(url.hostname)
            if(!(valid_hostname.includes(url.hostname)))
                return res.status(403).json({status: 'error', message: 'Invalid redirect hostname'});

            //make sure it's a secure connection
            if(url.protocol !== 'https')
                return res.status(403).json({status: 'error', message: 'Invalid protocol'});
        }
        //this is a relative redirect, just check that the path is valid
        else {
            let normalized;
            if(sanitized.startsWith('/'))
                normalized = sanitized.substring(1);
            let parts = normalized.split('/');
            let base_path = parts[0];
            if(!(validateBasePath(base_path)))
                return res.status(403).json({status: 'error', message: 'Invalid redirect url'});
        }

        return res.redirect(sanitized);
    }
}
module.exports = RedirectController;