var lang_1 = require('angular2/src/facade/lang');
// This is a workaround for privacy in Dart as we don't have library parts
function internalView(viewRef) {
    return viewRef._view;
}
exports.internalView = internalView;
// This is a workaround for privacy in Dart as we don't have library parts
function internalProtoView(protoViewRef) {
    return lang_1.isPresent(protoViewRef) ? protoViewRef._protoView : null;
}
exports.internalProtoView = internalProtoView;
/**
 * @exportedAs angular2/view
 */
var ViewRef = (function () {
    function ViewRef(_view) {
        this._view = _view;
    }
    Object.defineProperty(ViewRef.prototype, "render", {
        get: function () { return this._view.render; },
        enumerable: true,
        configurable: true
    });
    ViewRef.prototype.setLocal = function (contextName, value) { this._view.setLocal(contextName, value); };
    return ViewRef;
})();
exports.ViewRef = ViewRef;
/**
 * @exportedAs angular2/view
 */
var ProtoViewRef = (function () {
    function ProtoViewRef(_protoView) {
        this._protoView = _protoView;
    }
    return ProtoViewRef;
})();
exports.ProtoViewRef = ProtoViewRef;
