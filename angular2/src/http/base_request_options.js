var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") return Reflect.decorate(decorators, target, key, desc);
    switch (arguments.length) {
        case 2: return decorators.reduceRight(function(o, d) { return (d && d(o)) || o; }, target);
        case 3: return decorators.reduceRight(function(o, d) { return (d && d(target, key)), void 0; }, void 0);
        case 4: return decorators.reduceRight(function(o, d) { return (d && d(target, key, o)) || o; }, desc);
    }
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var enums_1 = require('./enums');
var di_1 = require('angular2/di');
var collection_1 = require('angular2/src/facade/collection');
/**
 * Creates a request options object with default properties as described in the [Fetch
 * Spec](https://fetch.spec.whatwg.org/#requestinit) to be optionally provided when instantiating a
 * {@link Request}. This class is used implicitly by {@link Http} to merge in provided request
 * options with the default options specified here. These same default options are injectable via
 * the {@link BaseRequestOptions} class.
 */
var RequestOptions = (function () {
    function RequestOptions(_a) {
        var _b = _a === void 0 ? {
            method: enums_1.RequestMethods.GET,
            mode: enums_1.RequestModesOpts.Cors
        } : _a, method = _b.method, headers = _b.headers, body = _b.body, mode = _b.mode, credentials = _b.credentials, cache = _b.cache;
        /**
         * Http method with which to execute the request.
         *
         * Defaults to "GET".
         */
        this.method = enums_1.RequestMethods.GET;
        this.mode = enums_1.RequestModesOpts.Cors;
        this.method = method;
        this.headers = headers;
        this.body = body;
        this.mode = mode;
        this.credentials = credentials;
        this.cache = cache;
    }
    /**
     * Creates a copy of the `RequestOptions` instance, using the optional input as values to override
     * existing values.
     */
    RequestOptions.prototype.merge = function (opts) {
        if (opts === void 0) { opts = {}; }
        return new RequestOptions(collection_1.StringMapWrapper.merge(this, opts));
    };
    return RequestOptions;
})();
exports.RequestOptions = RequestOptions;
/**
 * Injectable version of {@link RequestOptions}.
 *
 * #Example
 *
 * ```
 * import {Http, BaseRequestOptions, Request} from 'angular2/http';
 * ...
 * class MyComponent {
 *   constructor(baseRequestOptions:BaseRequestOptions, http:Http) {
 *     var options = baseRequestOptions.merge({body: 'foobar'});
 *     var request = new Request('https://foo', options);
 *     http.request(request).subscribe(res => this.bars = res.json());
 *   }
 * }
 *
 * ```
 */
var BaseRequestOptions = (function (_super) {
    __extends(BaseRequestOptions, _super);
    function BaseRequestOptions() {
        _super.call(this);
    }
    BaseRequestOptions = __decorate([
        di_1.Injectable(), 
        __metadata('design:paramtypes', [])
    ], BaseRequestOptions);
    return BaseRequestOptions;
})(RequestOptions);
exports.BaseRequestOptions = BaseRequestOptions;
