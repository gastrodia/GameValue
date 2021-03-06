var enums_1 = require('./enums');
var headers_1 = require('./headers');
// TODO(jeffbcross): properly implement body accessors
/**
 * Creates `Request` instances with default values.
 *
 * The Request's interface is inspired by the Request constructor defined in the [Fetch
 * Spec](https://fetch.spec.whatwg.org/#request-class),
 * but is considered a static value whose body can be accessed many times. There are other
 * differences in the implementation, but this is the most significant.
 */
var Request = (function () {
    function Request(/** Url of the remote resource */ url, _a) {
        var _b = _a === void 0 ? {} : _a, body = _b.body, _c = _b.method, method = _c === void 0 ? enums_1.RequestMethods.GET : _c, _d = _b.mode, mode = _d === void 0 ? enums_1.RequestModesOpts.Cors : _d, _e = _b.credentials, credentials = _e === void 0 ? enums_1.RequestCredentialsOpts.Omit : _e, _f = _b.headers, headers = _f === void 0 ? new headers_1.Headers() : _f;
        this.url = url;
        this._body = body;
        this.method = method;
        // Defaults to 'cors', consistent with browser
        // TODO(jeffbcross): implement behavior
        this.mode = mode;
        // Defaults to 'omit', consistent with browser
        // TODO(jeffbcross): implement behavior
        this.credentials = credentials;
        this.headers = headers;
    }
    /**
     * Returns the request's body as string, assuming that body exists. If body is undefined, return
     * empty
     * string.
     */
    Request.prototype.text = function () { return this._body ? this._body.toString() : ''; };
    return Request;
})();
exports.Request = Request;
