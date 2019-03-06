var nodeStatic = require('node-static');
var rootRequest = require('request');
var fs = require('fs');
var path = require('path');
var https = require('https');

var buildInProgress = false;
var buildStatus = {};

module.exports = function (options) {
    var host = '127.0.0.1';
    if (options && options.host) {
        host = host;
    }
    var baseUrl = ' ';
    let origin = ' ';
    var buildparam = 'build-azuredev';
    if (options.endpoint) {
        if (options.endpoint.toLowerCase() === 'uat'.toLowerCase()) {
            baseUrl = '';
            origin = ' ';

            buildparam = 'build-azureuat';
        } else if (options.endpoint.toLowerCase() === 'prod'.toLowerCase()) {
            baseUrl = ' ';
            origin = '';

            buildparam = 'prod';
        }
    }


    var requestOptions = {
        url: '',
        headers: {
            'Content-Type': 'application/json',
            'Origin': origin
        },
        method: 'POST',
        json: true,
        body: {}
    };


    fePort = options.fePort;
    folder = options.folder || 'master';
    var requestHandler = function (request, response) {
        var body = [];
        if (request.url.indexOf('api') >= 0) {
            request.on('data', function (chunk) {
                body.push(chunk);
            });
        }
        request.addListener('end', function () {
            if (request.method === 'OPTIONS') {
                response.setHeader('Access-Control-Allow-Origin', '*');
                response.setHeader('Access-Control-Allow-Headers', 'Authorization, Content-Type, x-api-key');
                response.setHeader('Access-Control-Allow-Methods', 'GET,POST,DELETE,PATCH');
                response.writeHead(200, {
                    'Content-Type': 'application/json'
                });
                response.end();

            } else if (request.url.indexOf('api') >= 0) {
                body = Buffer.concat(body).toString();
                try {
                    body = JSON.parse(body);
                } catch (e) { }
                requestOptions.url = baseUrl + request.url;
                requestOptions.body = body;
                if (request.url.indexOf('notifications') >= 0) {
                    console.log('device Token Body : ', JSON.stringify(body));
                }
                requestOptions.method = request.method;
                if (request.headers['authorization']) {
                    requestOptions.headers['authorization'] = request.headers['authorization'];
                }
                if (request.headers['Authorization']) {
                    requestOptions.headers['Authorization'] = request.headers['Authorization'];
                }

                if (request.headers['X-API-Key']) {
                    requestOptions.headers['X-API-Key'] = request.headers['X-API-Key'];
                }

                if (request.headers['X-API-Key'.toLowerCase()]) {
                    requestOptions.headers['X-API-Key'] = request.headers['X-API-Key'.toLowerCase()];
                }
                console.log(`[LOG ${requestOptions.method} ] : ${requestOptions.url}`);
                console.log(`[Request Details] : ` + JSON.stringify(requestOptions.headers));

                rootRequest(requestOptions, (err, resp, rootBody) => {
                    response.setHeader('Access-Control-Allow-Origin', '*');
                    response.setHeader('Access-Control-Expose-Headers', 'Authorization, Location, authorization');
                    response.setHeader('Access-Control-Allow-Methods', 'GET,POST,DELETE,PATCH');
                    if (resp) {
                        console.log('[LOG Response]')
                        if (resp.headers['authorization']) {
                            response.setHeader('authorization', resp.headers['authorization']);
                        }
                        if (resp.headers['Authorization']) {
                            response.setHeader('Authorization', resp.headers['Authorization']);
                        }

                        response.writeHead(resp.statusCode, {
                            'Content-Type': 'application/json'
                        });
                    } else {
                        console.log('[LOG Error] : ', err);
                        response.writeHead(400, {
                            'Content-Type': 'application/json'
                        });
                    }
                    if (rootBody) {
                        response.write(JSON.stringify(rootBody))
                    }
                    response.end();
                });
            } else if (request.url.indexOf('build') >= 0) {
                if (buildInProgress) {
                    response.writeHead(200, {
                        'Content-Type': 'application/json'
                    });
                    response.write(JSON.stringify({
                        msg: 'Build in prgoresssssss',
                        details: buildStatus
                    }));
                    response.end();
                } else {
                    const { exec } = require('child_process');
                    buildStatus = {};
                    buildInProgress = false;
                    response.writeHead(200, {
                        'Content-Type': 'application/json'
                    });
                    response.write(JSON.stringify({
                        msg: 'Build process is moved to web interface',
                        details: buildStatus
                    }));
                    response.end();
                }
            } else {
                if (buildInProgress) {
                    response.writeHead(200, { 'content-type': 'text/html' });
                    response.end(JSON.stringify({
                        msg: 'Build in prgoresssssss',
                        details: buildStatus
                    }));
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

    require('http').createServer(requestHandler).listen(fePort, () => {
        console.log('Server Listining on ' + fePort);
    });

    if (options && options.ssl) {
        let certOptions = {
            key: fs.readFileSync('ssl/server.key'),
            cert: fs.readFileSync('ssl/server.crt')
        };

        if (options.endpoint.toLowerCase() === 'prod'.toLowerCase()) {
            certOptions = {
                key: fs.readFileSync('ssl/server.key'),
                cert: fs.readFileSync('ssl/server.crt')
            };
        }
        let sslServer = https.createServer(certOptions, requestHandler).listen(443, () => {
            console.log('Server STarted ');
        });
        require('./web-socket/server/ws-server')({ server: sslServer });
    }
};