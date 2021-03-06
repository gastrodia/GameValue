var base_response_options_1 = require('./base_response_options');
var lang_1 = require('angular2/src/facade/lang');
var headers_1 = require('./headers');
// TODO: make this injectable so baseResponseOptions can be overridden, mostly for the benefit of
// headers merging.
/**
 * Creates `Response` instances with default values.
 *
 * Though this object isn't
 * usually instantiated by end-users, it is the primary object interacted with when it comes time to
 * add data to a view.
 *
 * #Example
 *
 * ```
 * http.request('my-friends.txt').subscribe(response => this.friends = response.text());
 * ```
 *
 * The Response's interface is inspired by the Request constructor defined in the [Fetch
 * Spec](https://fetch.spec.whatwg.org/#response-class), but is considered a static value whose body
 * can be accessed many times. There are other differences in the implementation, but this is the
 * most significant.
 */
var Response = (function () {
    function Response(_body, _a) {
        var _b = _a === void 0 ? base_response_options_1.baseResponseOptions : _a, status = _b.status, statusText = _b.statusText, headers = _b.headers, type = _b.type, url = _b.url;
        this._body = _body;
        if (lang_1.isJsObject(headers)) {
            headers = new headers_1.Headers(headers);
        }
        this.status = status;
        this.statusText = statusText;
        this.headers = headers;
        this.type = type;
        this.url = url;
    }
    /**
     * Not yet implemented
     */
    Response.prototype.blob = function () {
        throw new lang_1.BaseException('"blob()" method not implemented on Response superclass');
    };
    /**
     * Attempts to return body as parsed `JSON` object, or raises an exception.
     */
    Response.prototype.json = function () {
        if (lang_1.isJsObject(this._body)) {
            return this._body;
        }
        else if (lang_1.isString(this._body)) {
            return lang_1.global.JSON.parse(this._body);
        }
    };
    /**
     * Returns the body as a string, presuming `toString()` can be called on the response body.
     */
    Response.prototype.text = function () { return this._body.toString(); };
    /**
     * Not yet implemented
     */
    Response.prototype.arrayBuffer = function () {
        throw new lang_1.BaseException('"arrayBuffer()" method not implemented on Response superclass');
    };
    return Response;
})();
exports.Response = Response;
