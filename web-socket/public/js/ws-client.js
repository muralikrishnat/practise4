(function (w) {
    var guid = function () {
        function s4() {
            return Math.floor((1 + Math.random()) * 0x10000)
                .toString(16)
                .substring(1);
        }
        return s4() + s4() + s4() + s4();
    };
    var requestMapper = {};
    var SM = function () {
        this.wsClient = null;
        this.isConnected = false;
        this.opts = {};
    };
    SM.prototype.connect = function (url, protocol, opts) {
        let $that = this;
        $that.opts = opts;
        $that.wsClient = new WebSocket("wss://" + location.hostname, "echo-protocol");
        $that.wsClient.onopen = function (event) {
            $that.isConnected = true;
            $that.opts.onConnect && $that.opts.onConnect();
        };
        $that.wsClient.onclose = function (event) {
            $that.opts.onClose && $that.opts.onClose(event);
        };
        $that.wsClient.onmessage = function (event) {
            let data;
            try {
                data = JSON.parse(event.data);
            } catch (e) {
                //swallow
            }
            if (data && data.guid) {
                let rq = requestMapper['G' + data.guid];
                if (rq) {
                    rq.resolve(data.data);
                    delete rq;
                } else {
                    $that.opts.onReceive && $that.opts.onReceive(data);
                }
            } else {
                $that.opts.onReceive && $that.opts.onReceive(data);
            }
        };
    };
    SM.prototype.makeRequest = function (data, actionName) {
        let $that = this;
        return new Promise((res, rej) => {
            let requestGuid = guid();
            requestMapper['G' + requestGuid] = {
                resolve: res
            };
            $that.wsClient.send(JSON.stringify({ guid: requestGuid, actionName: actionName, data: data, requestType: 'LEGACY' }));
        });
    };
    w.socketManager = new SM();
    w.socketOnLoad && w.socketOnLoad();

    w.requestMapper = requestMapper;
})(window);