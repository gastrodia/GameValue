/// <reference path="../../typings/rx/rx.all.d.ts" />
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
var decorators_1 = require('angular2/src/di/decorators');
var static_request_1 = require('./static_request');
var xhr_backend_1 = require('./backends/xhr_backend');
var base_request_options_1 = require('./base_request_options');
var enums_1 = require('./enums');
var Rx = require('rx');
function httpRequest(backend, request) {
    return (Observable.create(function (observer) {
        var connection = backend.createConnection(request);
        var internalSubscription = connection.response.subscribe(observer);
        return function () {
            internalSubscription.dispose();
            connection.dispose();
        };
    }));
}
/**
 * Performs http requests using `XMLHttpRequest` as the default backend.
 *
 * `Http` is available as an injectable class, with methods to perform http requests. Calling
 * `request` returns an
 * [Observable](https://github.com/Reactive-Extensions/RxJS/blob/master/doc/api/core/observable.md),
 * which will emit a single {@link Response} when a response is
 * received.
 *
 * #Example
 *
 * ```
 * import {Http, httpInjectables} from 'angular2/http';
 * @Component({selector: 'http-app', appInjector: [httpInjectables]})
 * @View({templateUrl: 'people.html'})
 * class PeopleComponent {
 *   constructor(http: Http) {
 *     http('people.json')
 *       // Call map on the response observable to get the parsed people object
 *       .map(res => res.json())
 *       // Subscribe to the observable to get the parsed people object and attach it to the
 *       // component
 *       .subscribe(people => this.people = people);
 *   }
 * }
 * ```
 *
 * The default construct used to perform requests, `XMLHttpRequest`, is abstracted as a "Backend" (
 * {@link XHRBackend} in this case), which could be mocked with dependency injection by replacing
 * the {@link XHRBackend} binding, as in the following example:
 *
 * #Example
 *
 * ```
 * import {MockBackend, BaseRequestOptions, Http} from 'angular2/http';
 * var injector = Injector.resolveAndCreate([
 *   BaseRequestOptions,
 *   MockBackend,
 *   bind(Http).toFactory(
 *       function(backend, defaultOptions) {
 *         return new Http(backend, defaultOptions);
 *       },
 *       [MockBackend, BaseRequestOptions])
 * ]);
 * var http = injector.get(Http);
 * http.get('request-from-mock-backend.json').subscribe((res:Response) => doSomething(res));
 * ```
 *
 **/
var Http = (function () {
    function Http(_backend, _defaultOptions) {
        this._backend = _backend;
        this._defaultOptions = _defaultOptions;
    }
    /**
     * Performs any type of http request. First argument is required, and can either be a url or
     * a {@link Request} instance. If the first argument is a url, an optional {@link RequestOptions}
     * object can be provided as the 2nd argument. The options object will be merged with the values
     * of {@link BaseRequestOptions} before performing the request.
     */
    Http.prototype.request = function (url, options) {
        if (typeof url === 'string') {
            return httpRequest(this._backend, new static_request_1.Request(url, this._defaultOptions.merge(options)));
        }
        else if (url instanceof static_request_1.Request) {
            return httpRequest(this._backend, url);
        }
    };
    /**
     * Performs a request with `get` http method.
     */
    Http.prototype.get = function (url, options) {
        return httpRequest(this._backend, new static_request_1.Request(url, this._defaultOptions.merge(options)
            .merge({ method: enums_1.RequestMethods.GET })));
    };
    /**
     * Performs a request with `post` http method.
     */
    Http.prototype.post = function (url, body, options) {
        return httpRequest(this._backend, new static_request_1.Request(url, this._defaultOptions.merge(options)
            .merge({ body: body, method: enums_1.RequestMethods.POST })));
    };
    /**
     * Performs a request with `put` http method.
     */
    Http.prototype.put = function (url, body, options) {
        return httpRequest(this._backend, new static_request_1.Request(url, this._defaultOptions.merge(options)
            .merge({ body: body, method: enums_1.RequestMethods.PUT })));
    };
    /**
     * Performs a request with `delete` http method.
     */
    Http.prototype.delete = function (url, options) {
        return httpRequest(this._backend, new static_request_1.Request(url, this._defaultOptions.merge(options).merge({ method: enums_1.RequestMethods.DELETE })));
    };
    /**
     * Performs a request with `patch` http method.
     */
    Http.prototype.patch = function (url, body, options) {
        return httpRequest(this._backend, new static_request_1.Request(url, this._defaultOptions.merge(options)
            .merge({ body: body, method: enums_1.RequestMethods.PATCH })));
    };
    /**
     * Performs a request with `head` http method.
     */
    Http.prototype.head = function (url, options) {
        return httpRequest(this._backend, new static_request_1.Request(url, this._defaultOptions.merge(options)
            .merge({ method: enums_1.RequestMethods.HEAD })));
    };
    Http = __decorate([
        decorators_1.Injectable(), 
        __metadata('design:paramtypes', [XHRBackend, BaseRequestOptions])
    ], Http);
    return Http;
})();
exports.Http = Http;
var Observable;
if (Rx.hasOwnProperty('default')) {
    Observable = Rx.default.Rx.Observable;
}
else {
    Observable = Rx.Observable;
}
/**
 *
 * Alias to the `request` method of {@link Http}, for those who'd prefer a simple function instead
 * of an object. In order to get TypeScript type information about the `HttpFactory`, the {@link
 * IHttp} interface can be used as shown in the following example.
 *
 * #Example
 *
 * ```
 * import {httpInjectables, HttpFactory, IHttp} from 'angular2/http';
 * @Component({
 *   appInjector: [httpInjectables]
 * })
 * @View({
 *   templateUrl: 'people.html'
 * })
 * class MyComponent {
 *  constructor(@Inject(HttpFactory) http:IHttp) {
 *    http('people.json').subscribe(res => this.people = res.json());
 *  }
 * }
 * ```
 **/
function HttpFactory(backend, defaultOptions) {
    return function (url, options) {
        if (typeof url === 'string') {
            return httpRequest(backend, new static_request_1.Request(url, defaultOptions.merge(options)));
        }
        else if (url instanceof static_request_1.Request) {
            return httpRequest(backend, url);
        }
    };
}
exports.HttpFactory = HttpFactory;
