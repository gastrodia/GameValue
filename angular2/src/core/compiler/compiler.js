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
var lang_1 = require('angular2/src/facade/lang');
var async_1 = require('angular2/src/facade/async');
var collection_1 = require('angular2/src/facade/collection');
var directive_resolver_1 = require('./directive_resolver');
var view_ref_1 = require('./view_ref');
var element_injector_1 = require('./element_injector');
var template_resolver_1 = require('./template_resolver');
var component_url_mapper_1 = require('./component_url_mapper');
var proto_view_factory_1 = require('./proto_view_factory');
var url_resolver_1 = require('angular2/src/services/url_resolver');
var renderApi = require('angular2/src/render/api');
/**
 * Cache that stores the AppProtoView of the template of a component.
 * Used to prevent duplicate work and resolve cyclic dependencies.
 */
var CompilerCache = (function () {
    function CompilerCache() {
        this._cache = new collection_1.Map();
        this._hostCache = new collection_1.Map();
    }
    CompilerCache.prototype.set = function (component, protoView) { this._cache.set(component, protoView); };
    CompilerCache.prototype.get = function (component) {
        var result = this._cache.get(component);
        return lang_1.normalizeBlank(result);
    };
    CompilerCache.prototype.setHost = function (component, protoView) {
        this._hostCache.set(component, protoView);
    };
    CompilerCache.prototype.getHost = function (component) {
        var result = this._hostCache.get(component);
        return lang_1.normalizeBlank(result);
    };
    CompilerCache.prototype.clear = function () {
        this._cache.clear();
        this._hostCache.clear();
    };
    CompilerCache = __decorate([
        di_1.Injectable(), 
        __metadata('design:paramtypes', [])
    ], CompilerCache);
    return CompilerCache;
})();
exports.CompilerCache = CompilerCache;
/**
 * @exportedAs angular2/view
 */
var Compiler = (function () {
    function Compiler(reader, cache, templateResolver, componentUrlMapper, urlResolver, render, protoViewFactory) {
        this._reader = reader;
        this._compilerCache = cache;
        this._compiling = new collection_1.Map();
        this._templateResolver = templateResolver;
        this._componentUrlMapper = componentUrlMapper;
        this._urlResolver = urlResolver;
        this._appUrl = urlResolver.resolve(null, './');
        this._render = render;
        this._protoViewFactory = protoViewFactory;
    }
    Compiler.prototype._bindDirective = function (directiveTypeOrBinding) {
        if (directiveTypeOrBinding instanceof element_injector_1.DirectiveBinding) {
            return directiveTypeOrBinding;
        }
        else if (directiveTypeOrBinding instanceof di_1.Binding) {
            var annotation = this._reader.resolve(directiveTypeOrBinding.token);
            return element_injector_1.DirectiveBinding.createFromBinding(directiveTypeOrBinding, annotation);
        }
        else {
            var annotation = this._reader.resolve(directiveTypeOrBinding);
            return element_injector_1.DirectiveBinding.createFromType(directiveTypeOrBinding, annotation);
        }
    };
    // Create a hostView as if the compiler encountered <hostcmp></hostcmp>.
    // Used for bootstrapping.
    Compiler.prototype.compileInHost = function (componentTypeOrBinding) {
        var _this = this;
        var componentBinding = this._bindDirective(componentTypeOrBinding);
        Compiler._assertTypeIsComponent(componentBinding);
        var directiveMetadata = componentBinding.metadata;
        var hostPvPromise;
        var component = componentBinding.key.token;
        var hostAppProtoView = this._compilerCache.getHost(component);
        if (lang_1.isPresent(hostAppProtoView)) {
            hostPvPromise = async_1.PromiseWrapper.resolve(hostAppProtoView);
        }
        else {
            hostPvPromise = this._render.compileHost(directiveMetadata)
                .then(function (hostRenderPv) {
                return _this._compileNestedProtoViews(componentBinding, hostRenderPv, [componentBinding]);
            });
        }
        return hostPvPromise.then(function (hostAppProtoView) { return new view_ref_1.ProtoViewRef(hostAppProtoView); });
    };
    Compiler.prototype._compile = function (componentBinding) {
        var _this = this;
        var component = componentBinding.key.token;
        var protoView = this._compilerCache.get(component);
        if (lang_1.isPresent(protoView)) {
            // The component has already been compiled into an AppProtoView,
            // returns a plain AppProtoView, not wrapped inside of a Promise.
            // Needed for recursive components.
            return protoView;
        }
        var pvPromise = this._compiling.get(component);
        if (lang_1.isPresent(pvPromise)) {
            // The component is already being compiled, attach to the existing Promise
            // instead of re-compiling the component.
            // It happens when a template references a component multiple times.
            return pvPromise;
        }
        var template = this._templateResolver.resolve(component);
        var directives = this._flattenDirectives(template);
        for (var i = 0; i < directives.length; i++) {
            if (!Compiler._isValidDirective(directives[i])) {
                throw new lang_1.BaseException("Unexpected directive value '" + lang_1.stringify(directives[i]) + "' on the View of component '" + lang_1.stringify(component) + "'");
            }
        }
        var boundDirectives = collection_1.ListWrapper.map(directives, function (directive) { return _this._bindDirective(directive); });
        var renderTemplate = this._buildRenderTemplate(component, template, boundDirectives);
        pvPromise =
            this._render.compile(renderTemplate)
                .then(function (renderPv) {
                return _this._compileNestedProtoViews(componentBinding, renderPv, boundDirectives);
            });
        this._compiling.set(component, pvPromise);
        return pvPromise;
    };
    Compiler.prototype._compileNestedProtoViews = function (componentBinding, renderPv, directives) {
        var _this = this;
        var protoViews = this._protoViewFactory.createAppProtoViews(componentBinding, renderPv, directives);
        var protoView = protoViews[0];
        if (lang_1.isPresent(componentBinding)) {
            var component = componentBinding.key.token;
            if (renderPv.type === renderApi.ViewType.COMPONENT) {
                // Populate the cache before compiling the nested components,
                // so that components can reference themselves in their template.
                this._compilerCache.set(component, protoView);
                collection_1.MapWrapper.delete(this._compiling, component);
            }
            else {
                this._compilerCache.setHost(component, protoView);
            }
        }
        var nestedPVPromises = [];
        collection_1.ListWrapper.forEach(this._collectComponentElementBinders(protoViews), function (elementBinder) {
            var nestedComponent = elementBinder.componentDirective;
            var elementBinderDone = function (nestedPv) { elementBinder.nestedProtoView = nestedPv; };
            var nestedCall = _this._compile(nestedComponent);
            if (lang_1.isPromise(nestedCall)) {
                nestedPVPromises.push(nestedCall.then(elementBinderDone));
            }
            else {
                elementBinderDone(nestedCall);
            }
        });
        if (nestedPVPromises.length > 0) {
            return async_1.PromiseWrapper.all(nestedPVPromises).then(function (_) { return protoView; });
        }
        else {
            return protoView;
        }
    };
    Compiler.prototype._collectComponentElementBinders = function (protoViews) {
        var componentElementBinders = [];
        collection_1.ListWrapper.forEach(protoViews, function (protoView) {
            collection_1.ListWrapper.forEach(protoView.elementBinders, function (elementBinder) {
                if (lang_1.isPresent(elementBinder.componentDirective)) {
                    componentElementBinders.push(elementBinder);
                }
            });
        });
        return componentElementBinders;
    };
    Compiler.prototype._buildRenderTemplate = function (component, view, directives) {
        var _this = this;
        var componentUrl = this._urlResolver.resolve(this._appUrl, this._componentUrlMapper.getUrl(component));
        var templateAbsUrl = null;
        var styleAbsUrls = null;
        if (lang_1.isPresent(view.templateUrl)) {
            templateAbsUrl = this._urlResolver.resolve(componentUrl, view.templateUrl);
        }
        else if (lang_1.isPresent(view.template)) {
            // Note: If we have an inline template, we also need to send
            // the url for the component to the render so that it
            // is able to resolve urls in stylesheets.
            templateAbsUrl = componentUrl;
        }
        if (lang_1.isPresent(view.styleUrls)) {
            styleAbsUrls =
                collection_1.ListWrapper.map(view.styleUrls, function (url) { return _this._urlResolver.resolve(componentUrl, url); });
        }
        return new renderApi.ViewDefinition({
            componentId: lang_1.stringify(component),
            templateAbsUrl: templateAbsUrl, template: view.template,
            styleAbsUrls: styleAbsUrls,
            styles: view.styles,
            directives: collection_1.ListWrapper.map(directives, function (directiveBinding) { return directiveBinding.metadata; })
        });
    };
    Compiler.prototype._flattenDirectives = function (template) {
        if (lang_1.isBlank(template.directives))
            return [];
        var directives = [];
        this._flattenList(template.directives, directives);
        return directives;
    };
    Compiler.prototype._flattenList = function (tree, out) {
        for (var i = 0; i < tree.length; i++) {
            var item = di_1.resolveForwardRef(tree[i]);
            if (lang_1.isArray(item)) {
                this._flattenList(item, out);
            }
            else {
                out.push(item);
            }
        }
    };
    Compiler._isValidDirective = function (value) {
        return lang_1.isPresent(value) && (value instanceof lang_1.Type || value instanceof di_1.Binding);
    };
    Compiler._assertTypeIsComponent = function (directiveBinding) {
        if (directiveBinding.metadata.type !== renderApi.DirectiveMetadata.COMPONENT_TYPE) {
            throw new lang_1.BaseException("Could not load '" + lang_1.stringify(directiveBinding.key.token) + "' because it is not a component.");
        }
    };
    Compiler = __decorate([
        di_1.Injectable(), 
        __metadata('design:paramtypes', [DirectiveResolver, CompilerCache, TemplateResolver, ComponentUrlMapper, UrlResolver, renderApi.RenderCompiler, ProtoViewFactory])
    ], Compiler);
    return Compiler;
})();
exports.Compiler = Compiler;
