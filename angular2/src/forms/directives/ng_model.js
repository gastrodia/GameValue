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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var lang_1 = require('angular2/src/facade/lang');
var async_1 = require('angular2/src/facade/async');
var collection_1 = require('angular2/src/facade/collection');
var angular2_1 = require('angular2/angular2');
var di_1 = require('angular2/di');
var ng_control_1 = require('./ng_control');
var model_1 = require('../model');
var validators_1 = require('./validators');
var shared_1 = require('./shared');
var formControlBinding = lang_1.CONST_EXPR(new di_1.Binding(ng_control_1.NgControl, { toAlias: di_1.forwardRef(function () { return NgModel; }) }));
/**
 * Binds a domain model to the form.
 *
 * # Example
 *  ```
 * @Component({selector: "search-comp"})
 * @View({
 *      directives: [formDirectives],
 *      template: `
              <input type='text' [(ng-model)]="searchQuery">
 *      `})
 * class SearchComp {
 *  searchQuery: string;
 * }
 *  ```
 *
 * @exportedAs angular2/forms
 */
var NgModel = (function (_super) {
    __extends(NgModel, _super);
    // Scope the query once https://github.com/angular/angular/issues/2603 is fixed
    function NgModel(ngValidators) {
        _super.call(this);
        this._control = new model_1.Control("");
        this._added = false;
        this.update = new async_1.EventEmitter();
        this.ngValidators = ngValidators;
    }
    NgModel.prototype.onChange = function (c) {
        if (!this._added) {
            shared_1.setUpControl(this._control, this);
            this._control.updateValidity();
            this._added = true;
        }
        if (collection_1.StringMapWrapper.contains(c, "model")) {
            this._control.updateValue(this.model);
        }
    };
    Object.defineProperty(NgModel.prototype, "control", {
        get: function () { return this._control; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(NgModel.prototype, "path", {
        get: function () { return []; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(NgModel.prototype, "validator", {
        get: function () { return shared_1.composeNgValidator(this.ngValidators); },
        enumerable: true,
        configurable: true
    });
    NgModel.prototype.viewToModelUpdate = function (newValue) { async_1.ObservableWrapper.callNext(this.update, newValue); };
    NgModel = __decorate([
        angular2_1.Directive({
            selector: '[ng-model]:not([ng-control]):not([ng-form-control])',
            hostInjector: [formControlBinding],
            properties: ['model: ngModel'],
            events: ['update: ngModel'],
            lifecycle: [angular2_1.onChange],
            exportAs: 'form'
        }),
        __param(0, angular2_1.Query(validators_1.NgValidator)), 
        __metadata('design:paramtypes', [QueryList])
    ], NgModel);
    return NgModel;
})(ng_control_1.NgControl);
exports.NgModel = NgModel;
