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
var enums_1 = require('../enums');
var static_response_1 = require('../static_response');
var di_1 = require('angular2/di');
var browser_xhr_1 = require('./browser_xhr');
var Rx = require('rx');
/**
 * Creates connections using `XMLHttpRequest`. Given a fully-qualified
 * request, an `XHRConnection` will immediately create an `XMLHttpRequest` object and send the
 * request.
 *
 * This class would typically not be created or interacted with directly inside applications, though
 * the {@link MockConnection} may be interacted with in tests.
 */
var XHRConnection = (function () {
    function XHRConnection(req, NativeConstruct) {
        var _this = this;
        this.request = req;
        if (Rx.hasOwnProperty('default')) {
            this.response = new Rx.default.Rx.Subject();
        }
        else {
            this.response = new Rx.Subject();
        }
        this._xhr = new NativeConstruct();
        // TODO(jeffbcross): implement error listening/propagation
        this._xhr.open(enums_1.RequestMethods[req.method], req.url);
        this._xhr.addEventListener('load', function () { _this.response.onNext(new static_response_1.Response(_this._xhr.response || _this._xhr.responseText)); });
        // TODO(jeffbcross): make this more dynamic based on body type
        this._xhr.send(this.request.text());
    }
    /**
     * Calls abort on the underlying XMLHttpRequest.
     */
    XHRConnection.prototype.dispose = function () { this._xhr.abort(); };
    return XHRConnection;
})();
exports.XHRConnection = XHRConnection;
/**
 * Creates {@link XHRConnection} instances.
 *
 * This class would typically not be used by end users, but could be
 * overridden if a different backend implementation should be used,
 * such as in a node backend.
 *
 * #Example
 *
 * ```
 * import {Http, MyNodeBackend, httpInjectables, BaseRequestOptions} from 'angular2/http';
 * @Component({
 *   appInjector: [
 *     httpInjectables,
 *     bind(Http).toFactory((backend, options) => {
 *       return new Http(backend, options);
 *     }, [MyNodeBackend, BaseRequestOptions])]
 * })
 * class MyComponent {
 *   constructor(http:Http) {
 *     http('people.json').subscribe(res => this.people = res.json());
 *   }
 * }
 * ```
 *
 **/
var XHRBackend = (function () {
    function XHRBackend(_NativeConstruct) {
        this._NativeConstruct = _NativeConstruct;
    }
    XHRBackend.prototype.createConnection = function (request) {
        return new XHRConnection(request, this._NativeConstruct);
    };
    XHRBackend = __decorate([
        di_1.Injectable(), 
        __metadata('design:paramtypes', [BrowserXHR])
    ], XHRBackend);
    return XHRBackend;
})();
exports.XHRBackend = XHRBackend;
