var nodeStatic = require('node-static');

module.exports = function (options) {
    let fePort = options.fePort;
    let folder = options.folder || 'app';
    var file = new nodeStatic.Server('./' + folder);
    require('http').createServer((request, response) => {
        var body = [];
        if (request.url.indexOf('api') >= 0) {
            request.on('data', function (chunk) {
                body.push(chunk);
            });
        }

        request.addListener('end', function () {
            if (request.url.indexOf('api') >= 0) {
                body = Buffer.concat(body).toString();
                console.log('body ', body);
                response.writeHead(200, {
                    'Content-Type': 'application/json'
                });
                response.end(body);
            } else {
                file.serve(request, response, function (err, res) {
                    if (err && (err.status === 404) && request.url.indexOf('.html') < 0) {
                        file.serveFile('/index.html', 200, {}, request, response);
                    } else {
                        response.writeHead(200, { 'content-type': 'text/html' });
                        response.end('Resource Not Found');
                    }
                });
            }
        }).resume();
    }).listen(fePort, () => {
        console.log('Server Listining on ' + fePort);
    })
};