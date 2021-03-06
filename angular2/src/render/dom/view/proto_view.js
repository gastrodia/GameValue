var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var lang_1 = require('angular2/src/facade/lang');
var dom_adapter_1 = require('angular2/src/dom/dom_adapter');
var util_1 = require('../util');
var api_1 = require('../../api');
function resolveInternalDomProtoView(protoViewRef) {
    return protoViewRef._protoView;
}
exports.resolveInternalDomProtoView = resolveInternalDomProtoView;
var DomProtoViewRef = (function (_super) {
    __extends(DomProtoViewRef, _super);
    function DomProtoViewRef(_protoView) {
        _super.call(this);
        this._protoView = _protoView;
    }
    return DomProtoViewRef;
})(api_1.RenderProtoViewRef);
exports.DomProtoViewRef = DomProtoViewRef;
var DomProtoView = (function () {
    function DomProtoView(_a) {
        var elementBinders = _a.elementBinders, element = _a.element, transitiveContentTagCount = _a.transitiveContentTagCount, boundTextNodeCount = _a.boundTextNodeCount;
        this.element = element;
        this.elementBinders = elementBinders;
        this.transitiveContentTagCount = transitiveContentTagCount;
        this.isTemplateElement = dom_adapter_1.DOM.isTemplateElement(this.element);
        this.rootBindingOffset =
            (lang_1.isPresent(this.element) && dom_adapter_1.DOM.hasClass(this.element, util_1.NG_BINDING_CLASS)) ? 1 : 0;
        this.boundTextNodeCount = boundTextNodeCount;
        this.rootNodeCount =
            this.isTemplateElement ? dom_adapter_1.DOM.childNodes(dom_adapter_1.DOM.content(this.element)).length : 1;
    }
    return DomProtoView;
})();
exports.DomProtoView = DomProtoView;
