let httpProxy = require('http-proxy');
const { PassThrough } = require('stream');

function app(webapp_config) {
    if(webapp_config?.appmetrics?.enable) {
        require('appmetrics-dash').attach({
            host: '127.0.0.1',
            port: '1234'
        });
    }
    let proxy = httpProxy.createProxyServer({});
    let logger = webapp_config.logger;
    let proxied_hosts = webapp_config.proxied_hosts;

    return (req, res) => {
        let request_host = req.headers.host;
        if(!request_host)
            return logger.error("Missing host header");
        for(let proxied_host of proxied_hosts) {
            if(!(request_host == proxied_host.public_hostname))
                continue;
            
            logger.debug(`Proxying request for ${proxied_host.public_hostname} to ${proxied_host.target.url}`);
            proxy.web(req, res, {
                target: proxied_host.target.url
            });
            if(proxied_host.mirrors && Array.isArray(proxied_host.mirrors)) {
                for(let mirror of proxied_host.mirrors) {
                    logger.debug(`Proxying request for ${proxied_host.public_hostname} to ${mirror.url}`);
                    let mock_response = new PassThrough();
                    mock_response.setHeader = () => {};
                    mock_response.on('data', (data) => {
                        console.debug(`${mirror.url} response: ${data}`)
                    })
                    proxy.web(req, mock_response, {
                        target: mirror.url
                    });
                }
            }
        }
    }
}

module.exports = app;