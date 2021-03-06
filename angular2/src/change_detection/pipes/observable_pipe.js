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
var async_1 = require('angular2/src/facade/async');
var lang_1 = require('angular2/src/facade/lang');
var pipe_1 = require('./pipe');
/**
 * Implements async bindings to Observable.
 *
 * # Example
 *
 * In this example we bind the description observable to the DOM. The async pipe will convert an
 *observable to the
 * latest value it emitted. It will also request a change detection check when a new value is
 *emitted.
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
 *  description:Observable<string>;
 * }
 *
 * ```
 *
 * @exportedAs angular2/pipes
 */
var ObservablePipe = (function () {
    function ObservablePipe(_ref) {
        this._ref = _ref;
        this._latestValue = null;
        this._latestReturnedValue = null;
        this._subscription = null;
        this._observable = null;
    }
    ObservablePipe.prototype.supports = function (obs) { return async_1.ObservableWrapper.isObservable(obs); };
    ObservablePipe.prototype.onDestroy = function () {
        if (lang_1.isPresent(this._subscription)) {
            this._dispose();
        }
    };
    ObservablePipe.prototype.transform = function (obs) {
        if (lang_1.isBlank(this._subscription)) {
            this._subscribe(obs);
            return null;
        }
        if (obs !== this._observable) {
            this._dispose();
            return this.transform(obs);
        }
        if (this._latestValue === this._latestReturnedValue) {
            return this._latestReturnedValue;
        }
        else {
            this._latestReturnedValue = this._latestValue;
            return pipe_1.WrappedValue.wrap(this._latestValue);
        }
    };
    ObservablePipe.prototype._subscribe = function (obs) {
        var _this = this;
        this._observable = obs;
        this._subscription = async_1.ObservableWrapper.subscribe(obs, function (value) { _this._updateLatestValue(value); }, function (e) { throw e; });
    };
    ObservablePipe.prototype._dispose = function () {
        async_1.ObservableWrapper.dispose(this._subscription);
        this._latestValue = null;
        this._latestReturnedValue = null;
        this._subscription = null;
        this._observable = null;
    };
    ObservablePipe.prototype._updateLatestValue = function (value) {
        this._latestValue = value;
        this._ref.requestCheck();
    };
    return ObservablePipe;
})();
exports.ObservablePipe = ObservablePipe;
/**
 * Provides a factory for [ObervablePipe].
 *
 * @exportedAs angular2/pipes
 */
var ObservablePipeFactory = (function () {
    function ObservablePipeFactory() {
    }
    ObservablePipeFactory.prototype.supports = function (obs) { return async_1.ObservableWrapper.isObservable(obs); };
    ObservablePipeFactory.prototype.create = function (cdRef) { return new ObservablePipe(cdRef); };
    ObservablePipeFactory = __decorate([
        lang_1.CONST(), 
        __metadata('design:paramtypes', [])
    ], ObservablePipeFactory);
    return ObservablePipeFactory;
})();
exports.ObservablePipeFactory = ObservablePipeFactory;
