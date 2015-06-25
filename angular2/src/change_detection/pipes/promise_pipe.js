var lang_1 = require('angular2/src/facade/lang');
var pipe_1 = require('./pipe');
/**
 * Implements async bindings to Promise.
 *
 * # Example
 *
 * In this example we bind the description promise to the DOM.
 * The async pipe will convert a promise to the value with which it is resolved. It will also
 * request a change detection check when the promise is resolved.
 *
 *  ```
 * @Component({
 *   selector: "task-cmp",
 *   changeDetection: ON_PUSH
 * })
 * @View({
 *   template: "Task Description {{ description | async }}"
 * })
 * class Task {
 *   description:Promise<string>;
 * }
 *
 * ```
 *
 * @exportedAs angular2/pipes
 */
var PromisePipe = (function () {
    function PromisePipe(_ref) {
        this._ref = _ref;
        this._latestValue = null;
        this._latestReturnedValue = null;
    }
    PromisePipe.prototype.supports = function (promise) { return lang_1.isPromise(promise); };
    PromisePipe.prototype.onDestroy = function () {
        if (lang_1.isPresent(this._sourcePromise)) {
            this._latestValue = null;
            this._latestReturnedValue = null;
            this._sourcePromise = null;
        }
    };
    PromisePipe.prototype.transform = function (promise) {
        var _this = this;
        if (lang_1.isBlank(this._sourcePromise)) {
            this._sourcePromise = promise;
            promise.then(function (val) {
                if (_this._sourcePromise === promise) {
                    _this._updateLatestValue(val);
                }
            });
            return null;
        }
        if (promise !== this._sourcePromise) {
            this._sourcePromise = null;
            return this.transform(promise);
        }
        if (this._latestValue === this._latestReturnedValue) {
            return this._latestReturnedValue;
        }
        else {
            this._latestReturnedValue = this._latestValue;
            return pipe_1.WrappedValue.wrap(this._latestValue);
        }
    };
    PromisePipe.prototype._updateLatestValue = function (value) {
        this._latestValue = value;
        this._ref.requestCheck();
    };
    return PromisePipe;
})();
exports.PromisePipe = PromisePipe;
/**
 * Provides a factory for [PromisePipe].
 *
 * @exportedAs angular2/pipes
 */
var PromisePipeFactory = (function () {
    function PromisePipeFactory() {
    }
    PromisePipeFactory.prototype.supports = function (promise) { return lang_1.isPromise(promise); };
    PromisePipeFactory.prototype.create = function (cdRef) { return new PromisePipe(cdRef); };
    return PromisePipeFactory;
})();
exports.PromisePipeFactory = PromisePipeFactory;
