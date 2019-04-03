var WebSocketServer = require('websocket').server;
var { makeMeAdmin } = require('./actions');
var guid = function () {
    function s4() {
        return Math.floor((1 + Math.random()) * 0x10000)
            .toString(16)
            .substring(1);
    }
    return s4() + s4() + s4() + s4() + s4() + s4();
};
var connectionArray = [],
    adminConnections = [],
    connectionMapper = {};
var connectionManager = {
    add: function (guid, connection) {
        connectionArray.push({
            guid: guid,
            connection: connection
        });
    },
    remove: function (guid) {
        connectionArray = connectionArray.filter(f => f.guid != guid);
    },
    get: function () {
        return connectionArray.map((m, i) => {
            return { guid: m.guid, index: i };
        });
    },
    set: function (guid, opts) {
        connectionArray.forEach(c => {
            if (c.guid === guid) {
                Object.keys(opts).forEach(k => {
                    c[k] = opts[k];
                });
            }
        });
    },
    sendToConnection: function ({ toGuid, data, actionName }) {
        connectionArray.forEach(c => {
            if (c.guid === toGuid) {
                data['actionName'] = actionName;
                c.connection.sendUTF(JSON.stringify(data));
            }
        });
    }
};

var getAsyncTime = function (cb) {
    setTimeout(() => {
        cb({ time: (new Date).toString() });
    }, 200);
};

var broadCastData = function (data, opts = {}) {
    connectionArray.forEach(c => {
        if (opts.isOnlyAdmin) {
            if (c.isAdmin) {
                c.connection.sendUTF(JSON.stringify(data));
            }
        } else {
            c.connection.sendUTF(JSON.stringify(data));
        }
    });
};
var sendToAdmins = function (data) {
    broadCastData(data, {
        isOnlyAdmin: true
    });
};
var log = function () {
    // console.log({
    //     connectionArray: connectionArray.length,
    //     connectionArrayGuid: connectionArray.map(c => c.guid),
    //     connections: connectionManager.get()
    // });
    // console.log({
    //     connections: connectionManager.get()
    // })
};
function initWS(server) {
    let wsServer = new WebSocketServer({
        httpServer: server,
        autoAcceptConnections: false
    });

    wsServer.on('request', function (request) {
        var connection = request.accept('echo-protocol', request.origin);
        connection.on('message', function (message) {
            if (message.type === 'utf8') {
                var datafromClient = JSON.parse(message.utf8Data);
                var { requestType, actionName } = datafromClient;
                switch (actionName) {
                    case 'MAKE_ME_ADMIN':
                        connectionManager.set(connection.guid, {
                            isAdmin: true
                        });
                        sendToAdmins({
                            connections: connectionManager.get(),
                            actionName: 'CONNECTIONS'
                        });
                        break;
                    case 'EMIT_TO_GUID':
                        connectionManager.sendToConnection({
                            toGuid: datafromClient.toGuid,
                            data: datafromClient.data,
                            actionName: 'EMIT_TO_GUID'
                        });
                        break;
                    case 'GET_ME_GUID': 
                        let cGuid = guid();
                        connection.guid = cGuid;
                        connectionManager.add(cGuid, connection);
                        connection.sendUTF(JSON.stringify({ "guid": cGuid, actionName: 'NEW_CONNECTION', data: { "isConnected": true } }));
                        sendToAdmins({
                            connections: connectionManager.get(),
                            actionName: 'CONNECTIONS'
                        });
                        break;
                    default:
                        break;
                }
            }
            else if (message.type === 'binary') {
                console.log('Received Binary Message of ' + message.binaryData.length + ' bytes');
                //connection.sendBytes(message.binaryData);
            }
        });
        connection.on('close', function (reasonCode, description) {
            connectionManager.remove(connection.guid);
            log();
        });

        if (connection.connected) {
            // let cGuid = guid();
            // connection.guid = cGuid;
            // connectionManager.add(cGuid, connection);
            // log();
            // connection.sendUTF(JSON.stringify({ "guid": cGuid, actionName: 'NEW_CONNECTION', data: { "isConnected": true } }));
            // sendToAdmins({
            //     connections: connectionManager.get(),
            //     actionName: 'CONNECTIONS'
            // });
        }
    });
}

module.exports = function (options) {
    if (options.server) {
        initWS(options.server);
    }
};