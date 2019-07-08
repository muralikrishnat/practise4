var fs = require('fs');
var https = require('https');
var nodeStatic = require('node-static');
var path = require('path');
const mime = require('mime');
module.exports = function (options) {
    let folder = options.folder;
    let certOptions = {
        key: fs.readFileSync('ssl/server.key'),
        cert: fs.readFileSync('ssl/server.crt')
    };

    var requestHandler = async function (request, response) {
        const dt = new Date();
        console.log(`[LOG - ${request.method} - ${dt.getHours()}:${dt.getMinutes()}:${dt.getSeconds()}] `, request.url);
        var body = [];
        if (request.url.indexOf('api') >= 0) {
            request.on('data', function (chunk) {
                body.push(chunk);
            });
        }
        request.addListener('end', async function () {
            if (request.method === 'OPTIONS') {
                response.setHeader('Access-Control-Allow-Origin', '*');
                response.setHeader('Access-Control-Allow-Headers', 'Authorization, Content-Type, x-api-key');
                response.setHeader('Access-Control-Allow-Methods', 'GET,POST,DELETE,PATCH');
                response.writeHead(200, {
                    'Content-Type': 'application/json'
                });
                response.end();
            } else {
                if (request.url.indexOf('api') >= 0) {
                    if (request.method === 'GET') {
                        response.writeHead(200, {
                            "connection": "keep-alive",
                            "cache-control": "no-cache",
                            "content-type": "text/event-stream"
                        });
                        setInterval(() => {
                            console.log("sending data");
                            response.write('id: ' + (new Date).toString() + '\n');
                        }, 5000);
                        response.write("Started");
                    } else if (request.method === 'POST') {

                    }
                } else {
                    var file = new nodeStatic.Server('./' + folder, {
                        headers: {
                            gzip: true,
                            'Access-Control-Allow-Origin': '*',
                            'Access-Control-Allow-Methods': 'GET,POST,DELETE,PATCH',
                            'Access-Control-Allow-Headers': 'Authorization, Content-Type, x-api-key'
                        }
                    });
                    if (request.url.indexOf('.gz') >= 0) {
                        console.log('serving from gzip', request.url);
                        var headers = { 'Content-Encoding': 'gzip' };
                        if (request.url.indexOf('.css') >= 0) {
                            headers['Content-Type'] = 'text/css';
                        }
                        file.serveFile('/' + request.url, 200, headers, request, response);
                    } else {
                        file.serve(request, response, function (err, res) {
                            if (err && (err.status === 404) && request.url.indexOf('.html') < 0) {
                                fs.exists(path.join(__dirname, folder, 'index.html'), (exists) => {
                                    if (exists) {
                                        file.serveFile('/index.html', 200, {}, request, response);
                                    } else {
                                        response.writeHead(200, { 'content-type': 'text/html' });
                                        response.end(JSON.stringify({
                                            msg: 'Build in prgoresssssss static',
                                            details: buildStatus
                                        }));
                                    }
                                });
                            } else {
                                response.writeHead(200, { 'content-type': 'text/html' });
                                response.end('Resource Not Found');
                            }
                        });
                    }
                }
            }
        }).resume();
    };

    https.createServer(certOptions, function (req, res) {
        if (req.headers.accept && req.headers.accept == 'text/event-stream') {
            if (req.url == '/sse') {
                res.writeHead(200, {
                    'Content-Type': 'text/event-stream',
                    'Cache-Control': 'no-cache',
                    'Connection': 'keep-alive'
                });

                setInterval(function () {
                    res.write("data: " + (new Date).toLocaleTimeString() + '\n\n');
                }, 5000);

                res.write("data: " + (new Date).toLocaleTimeString() + '\n\n');

            } else {
                res.writeHead(404);
                res.end();
            }
        } else {
            res.writeHead(200, { 'Content-Type': 'text/html' });
            res.write(fs.readFileSync(path.join(__dirname, folder, 'index.html')));
            res.end();
        }
    }).listen(443, () => {
        console.log('Server STarted ');
    });

};