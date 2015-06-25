var lang_1 = require('angular2/src/facade/lang');
var dom_adapter_1 = require('angular2/src/dom/dom_adapter');
var ShadowDomCompileStep = (function () {
    function ShadowDomCompileStep(_shadowDomStrategy, _template, _subTaskPromises) {
        this._shadowDomStrategy = _shadowDomStrategy;
        this._template = _template;
        this._subTaskPromises = _subTaskPromises;
    }
    ShadowDomCompileStep.prototype.process = function (parent, current, control) {
        var tagName = dom_adapter_1.DOM.tagName(current.element).toUpperCase();
        if (tagName == 'STYLE') {
            this._processStyleElement(current, control);
        }
        else if (tagName == 'CONTENT') {
            this._processContentElement(current);
        }
        else {
            var componentId = current.isBound() ? current.inheritedElementBinder.componentId : null;
            this._shadowDomStrategy.processElement(this._template.componentId, componentId, current.element);
        }
    };
    ShadowDomCompileStep.prototype._processStyleElement = function (current, control) {
        var stylePromise = this._shadowDomStrategy.processStyleElement(this._template.componentId, this._template.templateAbsUrl, current.element);
        if (lang_1.isPresent(stylePromise) && lang_1.isPromise(stylePromise)) {
            this._subTaskPromises.push(stylePromise);
        }
        // Style elements should not be further processed by the compiler, as they can not contain
        // bindings. Skipping further compiler steps allow speeding up the compilation process.
        control.ignoreCurrentElement();
    };
    ShadowDomCompileStep.prototype._processContentElement = function (current) {
        if (this._shadowDomStrategy.hasNativeContentElement()) {
            return;
        }
        var attrs = current.attrs();
        var selector = attrs.get('select');
        selector = lang_1.isPresent(selector) ? selector : '';
        var contentStart = dom_adapter_1.DOM.createScriptTag('type', 'ng/contentStart');
        if (lang_1.assertionsEnabled()) {
            dom_adapter_1.DOM.setAttribute(contentStart, 'select', selector);
        }
        var contentEnd = dom_adapter_1.DOM.createScriptTag('type', 'ng/contentEnd');
        dom_adapter_1.DOM.insertBefore(current.element, contentStart);
        dom_adapter_1.DOM.insertBefore(current.element, contentEnd);
        dom_adapter_1.DOM.remove(current.element);
        current.element = contentStart;
        current.bindElement().setContentTagSelector(selector);
    };
    return ShadowDomCompileStep;
})();
exports.ShadowDomCompileStep = ShadowDomCompileStep;
