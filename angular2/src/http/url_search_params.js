var lang_1 = require('angular2/src/facade/lang');
var collection_1 = require('angular2/src/facade/collection');
function paramParser(rawParams) {
    var map = new collection_1.Map();
    var params = lang_1.StringWrapper.split(rawParams, '&');
    collection_1.ListWrapper.forEach(params, function (param) {
        var split = lang_1.StringWrapper.split(param, '=');
        var key = collection_1.ListWrapper.get(split, 0);
        var val = collection_1.ListWrapper.get(split, 1);
        var list = map.get(key) || [];
        list.push(val);
        map.set(key, list);
    });
    return map;
}
var URLSearchParams = (function () {
    function URLSearchParams(rawParams) {
        this.rawParams = rawParams;
        this.paramsMap = paramParser(rawParams);
    }
    URLSearchParams.prototype.has = function (param) { return this.paramsMap.has(param); };
    URLSearchParams.prototype.get = function (param) { return collection_1.ListWrapper.first(this.paramsMap.get(param)); };
    URLSearchParams.prototype.getAll = function (param) { return this.paramsMap.get(param) || []; };
    URLSearchParams.prototype.append = function (param, val) {
        var list = this.paramsMap.get(param) || [];
        list.push(val);
        this.paramsMap.set(param, list);
    };
    URLSearchParams.prototype.toString = function () {
        var paramsList = [];
        collection_1.MapWrapper.forEach(this.paramsMap, function (values, k) {
            collection_1.ListWrapper.forEach(values, function (v) { paramsList.push(k + '=' + v); });
        });
        return collection_1.ListWrapper.join(paramsList, '&');
    };
    URLSearchParams.prototype.delete = function (param) { collection_1.MapWrapper.delete(this.paramsMap, param); };
    return URLSearchParams;
})();
exports.URLSearchParams = URLSearchParams;
