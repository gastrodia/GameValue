var headers_1 = require('./headers');
var enums_1 = require('./enums');
var BaseResponseOptions = (function () {
    function BaseResponseOptions(_a) {
        var _b = _a === void 0 ? {} : _a, _c = _b.status, status = _c === void 0 ? 200 : _c, _d = _b.statusText, statusText = _d === void 0 ? 'Ok' : _d, _e = _b.type, type = _e === void 0 ? enums_1.ResponseTypes.Default : _e, _f = _b.headers, headers = _f === void 0 ? new headers_1.Headers() : _f, _g = _b.url, url = _g === void 0 ? '' : _g;
        this.status = status;
        this.statusText = statusText;
        this.type = type;
        this.headers = headers;
        this.url = url;
    }
    return BaseResponseOptions;
})();
exports.BaseResponseOptions = BaseResponseOptions;
;
exports.baseResponseOptions = Object.freeze(new BaseResponseOptions());
