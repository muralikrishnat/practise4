var storeManager = (function () {
    var storeData = {};
    var S = function () {
        this.config = {};
    };
    S.prototype.init = function (config) {
        this.config = config;
    };
    S.prototype.get = function (config) {
       return storeData;
    };
    S.prototype.scope = function (elemId, scopeData) {
        if (scopeData) {
            storeData['S' + elemId] = Object.assign({}, scopeData);
        }
        return storeData['S' + elemId];
    };
    return new S();
})();