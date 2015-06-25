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
var annotations_1 = require('angular2/annotations');
var core_1 = require('angular2/core');
var pipe_registry_1 = require('angular2/src/change_detection/pipes/pipe_registry');
var lang_1 = require('angular2/src/facade/lang');
var api_1 = require('angular2/src/render/api');
var CSSClass = (function () {
    function CSSClass(_pipeRegistry, _ngEl, _renderer) {
        this._pipeRegistry = _pipeRegistry;
        this._ngEl = _ngEl;
        this._renderer = _renderer;
    }
    Object.defineProperty(CSSClass.prototype, "rawClass", {
        set: function (v) {
            this._rawClass = v;
            this._pipe = this._pipeRegistry.get('keyValDiff', this._rawClass);
        },
        enumerable: true,
        configurable: true
    });
    CSSClass.prototype._toggleClass = function (className, enabled) {
        this._renderer.setElementClass(this._ngEl, className, enabled);
    };
    CSSClass.prototype.onCheck = function () {
        var diff = this._pipe.transform(this._rawClass);
        if (lang_1.isPresent(diff))
            this._applyChanges(diff.wrapped);
    };
    CSSClass.prototype._applyChanges = function (diff) {
        var _this = this;
        if (lang_1.isPresent(diff)) {
            diff.forEachAddedItem(function (record) { _this._toggleClass(record.key, record.currentValue); });
            diff.forEachChangedItem(function (record) { _this._toggleClass(record.key, record.currentValue); });
            diff.forEachRemovedItem(function (record) {
                if (record.previousValue) {
                    _this._toggleClass(record.key, false);
                }
            });
        }
    };
    CSSClass = __decorate([
        annotations_1.Directive({ selector: '[class]', lifecycle: [annotations_1.onCheck], properties: ['rawClass: class'] }), 
        __metadata('design:paramtypes', [PipeRegistry, ElementRef, Renderer])
    ], CSSClass);
    return CSSClass;
})();
exports.CSSClass = CSSClass;
