var WebSocketServer = require('websocket').server;
var guid = function () {
    function s4() {
        return Math.floor((1 + Math.random()) * 0x10000)
            .toString(16)
            .substring(1);
    }
    return s4() + s4() + s4() + s4() + s4() + s4();
};
var connectionArray = [],
    wsArray = [],
    connectionMapper = {};
var requestJobMapper = {};
var connectionManager = {
    add: function (guid, connection) {
        connectionArray.push('C' + guid);
        connectionMapper['C' + guid] = {
            connection: connection
        };
    },
    remove: function (guid) {
        connectionArray = connectionArray.filter(f => f === 'C' + guid);
        delete connectionMapper['C' + guid];
    }
};

var getAsyncTime = function (cb) {
    setTimeout(() => {
        cb({ time: (new Date).toString() });
    }, 200);
};
function initWS(server) {
    let wsServer = new WebSocketServer({
        httpServer: server,
        autoAcceptConnections: false
    });

    wsServer.on('request', function (request) {
        var connection = request.accept('echo-protocol', request.origin);
        console.log((new Date()) + ' Connection accepted.');
        connection.on('message', function (message) {
            if (message.type === 'utf8') {
                var datafromClient = JSON.parse(message.utf8Data);
                console.log('Received Message: ', message.utf8Data);
                // connection.sendUTF(JSON.stringify(datafromClient));
                if (datafromClient.requestType && datafromClient.requestType === 'LEGACY') {
                    getAsyncTime(function (data) {
                        connection.sendUTF(JSON.stringify({
                            data,
                            guid: datafromClient.guid
                        }));
                    });
                } else {

                }
            }
            else if (message.type === 'binary') {
                console.log('Received Binary Message of ' + message.binaryData.length + ' bytes');
                //connection.sendBytes(message.binaryData);
            }
        });
        connection.on('close', function (reasonCode, description) {
            console.log((new Date()) + ' Peer ' + connection.remoteAddress + ' disconnected.');
            connectionManager.remove(connection.guid);
        });

        if (connection.connected) {
            let cGuid = guid();
            connection.guid = cGuid;
            connectionManager.add(cGuid, connection);
            connection.sendUTF(JSON.stringify({ "guid": cGuid, data: { "isConnected": true } }));
        }
    });
}

module.exports = function (options) {
    if (options.server) {
        initWS(options.server);
    }
};