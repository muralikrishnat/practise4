
var siteManager = (function () {
    var data = {
        name: 'Site Builder'
    };
    var P = function () {
        this.config = {
            serverUrl: '',
            storage: 'localStorage'
        };
    };
    P.prototype.init = function (config) {
        this.config = config;
        storeManager.init(config);
    };
    return new P();
})();

var apiManager = (function () {
    var A = function () { };
    A.prototype.get = function (opts) {
        let url = opts.url;
        url = url + (url.indexOf('?') >= 0 ? '&': '?') + 'no-cache=' + (new Date).getTime();
        return fetch(url).then(response => {
            if (opts.isRaw) {
                return response.text();
            } else {
                return response.json();
            }
        });
    };
    A.prototype.post = function(opts){
        return fetch(opts.url, {
            method: 'POST',
            mode: 'cors',
            cache: 'no-cache',
            credentials: 'include',
            headers: {
                "Content-Type": "application/json"
            },
            referrer: 'no-referrer',
            body: JSON.stringify(opts.body)
        });
    }
    A.prototype.uploadFile = function(opts){
        var formData = new FormData();
        formData.append('path', opts.path);
        formData.append('file', opts.file)
        return fetch(opts.url, {
            method: 'POST',
            body: formData
        });
    }; 
    return new A();

})();

var fileManager = (function () {
    var F = function () { };
    F.prototype.load = function (files) {

    };
    return new F();
})();

