var lang_1 = require('angular2/src/facade/lang');
var collection_1 = require('angular2/src/facade/collection');
var dom_adapter_1 = require('angular2/src/dom/dom_adapter');
var selector_1 = require('angular2/src/render/dom/compiler/selector');
var api_1 = require('../../api');
var util_1 = require('../util');
/**
 * Parses the directives on a single element. Assumes ViewSplitter has already created
 * <template> elements for template directives.
 */
var DirectiveParser = (function () {
    function DirectiveParser(_parser, _directives) {
        this._parser = _parser;
        this._directives = _directives;
        this._selectorMatcher = new selector_1.SelectorMatcher();
        for (var i = 0; i < _directives.length; i++) {
            var directive = _directives[i];
            var selector = selector_1.CssSelector.parse(directive.selector);
            this._ensureComponentOnlyHasElementSelector(selector, directive);
            this._selectorMatcher.addSelectables(selector, i);
        }
    }
    DirectiveParser.prototype._ensureComponentOnlyHasElementSelector = function (selector, directive) {
        var isElementSelector = selector.length === 1 && selector[0].isElementSelector();
        if (!isElementSelector && directive.type === api_1.DirectiveMetadata.COMPONENT_TYPE) {
            throw new lang_1.BaseException("Component '" + directive.id + "' can only have an element selector, but had '" + directive.selector + "'");
        }
    };
    DirectiveParser.prototype.process = function (parent, current, control) {
        var _this = this;
        var attrs = current.attrs();
        var classList = current.classList();
        var cssSelector = new selector_1.CssSelector();
        var nodeName = dom_adapter_1.DOM.nodeName(current.element);
        cssSelector.setElement(nodeName);
        for (var i = 0; i < classList.length; i++) {
            cssSelector.addClassName(classList[i]);
        }
        collection_1.MapWrapper.forEach(attrs, function (attrValue, attrName) { cssSelector.addAttribute(attrName, attrValue); });
        var componentDirective;
        var foundDirectiveIndices = [];
        var elementBinder = null;
        this._selectorMatcher.match(cssSelector, function (selector, directiveIndex) {
            elementBinder = current.bindElement();
            var directive = _this._directives[directiveIndex];
            if (directive.type === api_1.DirectiveMetadata.COMPONENT_TYPE) {
                // components need to go first, so it is easier to locate them in the result.
                collection_1.ListWrapper.insert(foundDirectiveIndices, 0, directiveIndex);
                if (lang_1.isPresent(componentDirective)) {
                    throw new lang_1.BaseException("Only one component directive is allowed per element - check " + current.elementDescription);
                }
                componentDirective = directive;
                elementBinder.setComponentId(directive.id);
            }
            else {
                foundDirectiveIndices.push(directiveIndex);
            }
        });
        collection_1.ListWrapper.forEach(foundDirectiveIndices, function (directiveIndex) {
            var dirMetadata = _this._directives[directiveIndex];
            var directiveBinderBuilder = elementBinder.bindDirective(directiveIndex);
            current.compileChildren = current.compileChildren && dirMetadata.compileChildren;
            if (lang_1.isPresent(dirMetadata.properties)) {
                collection_1.ListWrapper.forEach(dirMetadata.properties, function (bindConfig) {
                    _this._bindDirectiveProperty(bindConfig, current, directiveBinderBuilder);
                });
            }
            if (lang_1.isPresent(dirMetadata.hostListeners)) {
                collection_1.MapWrapper.forEach(dirMetadata.hostListeners, function (action, eventName) {
                    _this._bindDirectiveEvent(eventName, action, current, directiveBinderBuilder);
                });
            }
            if (lang_1.isPresent(dirMetadata.hostProperties)) {
                collection_1.MapWrapper.forEach(dirMetadata.hostProperties, function (expression, hostPropertyName) {
                    _this._bindHostProperty(hostPropertyName, expression, current, directiveBinderBuilder);
                });
            }
            if (lang_1.isPresent(dirMetadata.hostAttributes)) {
                collection_1.MapWrapper.forEach(dirMetadata.hostAttributes, function (hostAttrValue, hostAttrName) {
                    _this._addHostAttribute(hostAttrName, hostAttrValue, current);
                });
            }
            if (lang_1.isPresent(dirMetadata.readAttributes)) {
                collection_1.ListWrapper.forEach(dirMetadata.readAttributes, function (attrName) { elementBinder.readAttribute(attrName); });
            }
        });
    };
    DirectiveParser.prototype._bindDirectiveProperty = function (bindConfig, compileElement, directiveBinderBuilder) {
        // Name of the property on the directive
        var dirProperty;
        // Name of the property on the element
        var elProp;
        var pipes;
        var assignIndex = bindConfig.indexOf(':');
        if (assignIndex > -1) {
            // canonical syntax: `dirProp: elProp | pipe0 | ... | pipeN`
            dirProperty = lang_1.StringWrapper.substring(bindConfig, 0, assignIndex).trim();
            pipes = this._splitBindConfig(lang_1.StringWrapper.substring(bindConfig, assignIndex + 1));
            elProp = collection_1.ListWrapper.removeAt(pipes, 0);
        }
        else {
            // shorthand syntax when the name of the property on the directive and on the element is the
            // same, ie `property`
            dirProperty = bindConfig;
            elProp = bindConfig;
            pipes = [];
        }
        elProp = util_1.dashCaseToCamelCase(elProp);
        var bindingAst = compileElement.bindElement().propertyBindings.get(elProp);
        if (lang_1.isBlank(bindingAst)) {
            var attributeValue = compileElement.attrs().get(util_1.camelCaseToDashCase(elProp));
            if (lang_1.isPresent(attributeValue)) {
                bindingAst =
                    this._parser.wrapLiteralPrimitive(attributeValue, compileElement.elementDescription);
            }
        }
        // Bindings are optional, so this binding only needs to be set up if an expression is given.
        if (lang_1.isPresent(bindingAst)) {
            directiveBinderBuilder.bindProperty(dirProperty, bindingAst, elProp);
        }
    };
    DirectiveParser.prototype._bindDirectiveEvent = function (eventName, action, compileElement, directiveBinderBuilder) {
        var ast = this._parser.parseAction(action, compileElement.elementDescription);
        if (lang_1.StringWrapper.contains(eventName, util_1.EVENT_TARGET_SEPARATOR)) {
            var parts = eventName.split(util_1.EVENT_TARGET_SEPARATOR);
            directiveBinderBuilder.bindEvent(parts[1], ast, parts[0]);
        }
        else {
            directiveBinderBuilder.bindEvent(eventName, ast);
        }
    };
    DirectiveParser.prototype._bindHostProperty = function (hostPropertyName, expression, compileElement, directiveBinderBuilder) {
        var ast = this._parser.parseSimpleBinding(expression, "hostProperties of " + compileElement.elementDescription);
        directiveBinderBuilder.bindHostProperty(hostPropertyName, ast);
    };
    DirectiveParser.prototype._addHostAttribute = function (attrName, attrValue, compileElement) {
        if (lang_1.StringWrapper.equals(attrName, 'class')) {
            collection_1.ListWrapper.forEach(attrValue.split(' '), function (className) { dom_adapter_1.DOM.addClass(compileElement.element, className); });
        }
        else if (!dom_adapter_1.DOM.hasAttribute(compileElement.element, attrName)) {
            dom_adapter_1.DOM.setAttribute(compileElement.element, attrName, attrValue);
        }
    };
    DirectiveParser.prototype._splitBindConfig = function (bindConfig) {
        return collection_1.ListWrapper.map(bindConfig.split('|'), function (s) { return s.trim(); });
    };
    return DirectiveParser;
})();
exports.DirectiveParser = DirectiveParser;
