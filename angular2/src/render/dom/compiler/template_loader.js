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
var collection_1 = require('angular2/src/facade/collection');
var async_1 = require('angular2/src/facade/async');
var dom_adapter_1 = require('angular2/src/dom/dom_adapter');
var xhr_1 = require('angular2/src/render/xhr');
var url_resolver_1 = require('angular2/src/services/url_resolver');
/**
 * Strategy to load component templates.
 * TODO: Make public API once we are more confident in this approach.
 */
var TemplateLoader = (function () {
    function TemplateLoader(_xhr, urlResolver) {
        this._xhr = _xhr;
        this._cache = new collection_1.Map();
    }
    TemplateLoader.prototype.load = function (view) {
        var _this = this;
        var html;
        var fetchedStyles;
        // Load the HTML
        if (lang_1.isPresent(view.template)) {
            html = async_1.PromiseWrapper.resolve(view.template);
        }
        else if (lang_1.isPresent(view.templateAbsUrl)) {
            html = this._loadText(view.templateAbsUrl);
        }
        else {
            throw new lang_1.BaseException('View should have either the templateUrl or template property set');
        }
        // Load the styles
        if (lang_1.isPresent(view.styleAbsUrls) && view.styleAbsUrls.length > 0) {
            fetchedStyles = collection_1.ListWrapper.map(view.styleAbsUrls, function (url) { return _this._loadText(url); });
        }
        else {
            fetchedStyles = [];
        }
        // Inline the styles and return a template element
        return async_1.PromiseWrapper.all(collection_1.ListWrapper.concat([html], fetchedStyles))
            .then(function (res) {
            var html = res[0];
            var fetchedStyles = collection_1.ListWrapper.slice(res, 1);
            html = _createStyleTags(view.styles) + _createStyleTags(fetchedStyles) + html;
            return dom_adapter_1.DOM.createTemplate(html);
        });
    };
    TemplateLoader.prototype._loadText = function (url) {
        var response = this._cache.get(url);
        if (lang_1.isBlank(response)) {
            // TODO(vicb): change error when TS gets fixed
            // https://github.com/angular/angular/issues/2280
            // throw new BaseException(`Failed to fetch url "${url}"`);
            response = async_1.PromiseWrapper.catchError(this._xhr.get(url), function (_) { return async_1.PromiseWrapper.reject(new lang_1.BaseException("Failed to fetch url \"" + url + "\""), null); });
            this._cache.set(url, response);
        }
        return response;
    };
    TemplateLoader = __decorate([
        di_1.Injectable(), 
        __metadata('design:paramtypes', [XHR, UrlResolver])
    ], TemplateLoader);
    return TemplateLoader;
})();
exports.TemplateLoader = TemplateLoader;
function _createStyleTags(styles) {
    return lang_1.isBlank(styles) ?
        '' :
        collection_1.ListWrapper.map(styles, function (css) { return ("<style type='text/css'>" + css + "</style>"); }).join('');
}
