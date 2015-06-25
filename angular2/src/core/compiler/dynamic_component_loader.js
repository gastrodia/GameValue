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
var di_1 = require('angular2/di');
var compiler_1 = require('./compiler');
var view_manager_1 = require('angular2/src/core/compiler/view_manager');
/**
 * @exportedAs angular2/view
 */
var ComponentRef = (function () {
    function ComponentRef(location, instance, dispose) {
        this.location = location;
        this.instance = instance;
        this.dispose = dispose;
    }
    Object.defineProperty(ComponentRef.prototype, "hostView", {
        get: function () { return this.location.parentView; },
        enumerable: true,
        configurable: true
    });
    return ComponentRef;
})();
exports.ComponentRef = ComponentRef;
/**
 * Service for dynamically loading a Component into an arbitrary position in the internal Angular
 * application tree.
 *
 * @exportedAs angular2/view
 */
var DynamicComponentLoader = (function () {
    function DynamicComponentLoader(_compiler, _viewManager) {
        this._compiler = _compiler;
        this._viewManager = _viewManager;
    }
    /**
     * Loads a root component that is placed at the first element that matches the
     * component's selector.
     * The loaded component receives injection normally as a hosted view.
     */
    DynamicComponentLoader.prototype.loadAsRoot = function (typeOrBinding, overrideSelector, injector) {
        var _this = this;
        if (overrideSelector === void 0) { overrideSelector = null; }
        if (injector === void 0) { injector = null; }
        return this._compiler.compileInHost(typeOrBinding)
            .then(function (hostProtoViewRef) {
            var hostViewRef = _this._viewManager.createRootHostView(hostProtoViewRef, overrideSelector, injector);
            var newLocation = _this._viewManager.getHostElement(hostViewRef);
            var component = _this._viewManager.getComponent(newLocation);
            var dispose = function () { _this._viewManager.destroyRootHostView(hostViewRef); };
            return new ComponentRef(newLocation, component, dispose);
        });
    };
    /**
     * Loads a component into the component view of the provided ElementRef
     * next to the element with the given name
     * The loaded component receives
     * injection normally as a hosted view.
     */
    DynamicComponentLoader.prototype.loadIntoLocation = function (typeOrBinding, hostLocation, anchorName, injector) {
        if (injector === void 0) { injector = null; }
        return this.loadNextToLocation(typeOrBinding, this._viewManager.getNamedElementInComponentView(hostLocation, anchorName), injector);
    };
    /**
     * Loads a component next to the provided ElementRef. The loaded component receives
     * injection normally as a hosted view.
     */
    DynamicComponentLoader.prototype.loadNextToLocation = function (typeOrBinding, location, injector) {
        var _this = this;
        if (injector === void 0) { injector = null; }
        return this._compiler.compileInHost(typeOrBinding)
            .then(function (hostProtoViewRef) {
            var viewContainer = _this._viewManager.getViewContainer(location);
            var hostViewRef = viewContainer.create(hostProtoViewRef, viewContainer.length, null, injector);
            var newLocation = _this._viewManager.getHostElement(hostViewRef);
            var component = _this._viewManager.getComponent(newLocation);
            var dispose = function () {
                var index = viewContainer.indexOf(hostViewRef);
                viewContainer.remove(index);
            };
            return new ComponentRef(newLocation, component, dispose);
        });
    };
    DynamicComponentLoader = __decorate([
        di_1.Injectable(), 
        __metadata('design:paramtypes', [Compiler, AppViewManager])
    ], DynamicComponentLoader);
    return DynamicComponentLoader;
})();
exports.DynamicComponentLoader = DynamicComponentLoader;
