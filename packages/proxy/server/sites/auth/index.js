module.exports = {
    test: function(req) {
        if(req.path.startsWith('/auth'))
            return true;
        return false;
    },
    handle: async function(req, res) {
        proxy.web(req,res, {
            target: `http://${process.env.AUTH_HOST}:${process.env.AUTH_HTTP_PORT}`,
            headers: {
                REMOTE_USER: 'test'
            }
        });
    }
}