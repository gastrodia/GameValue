var lang_1 = require('angular2/src/facade/lang');
/**
 * @exportedAs angular2/view
 */
var ElementRef = (function () {
    function ElementRef(parentView, boundElementIndex, _renderer) {
        this.parentView = parentView;
        this.boundElementIndex = boundElementIndex;
        this._renderer = _renderer;
    }
    Object.defineProperty(ElementRef.prototype, "renderView", {
        get: function () { return this.parentView.render; },
        // TODO(tbosch): remove this once Typescript supports declaring interfaces
        // that contain getters
        set: function (viewRef) { throw new lang_1.BaseException('Abstract setter'); },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(ElementRef.prototype, "nativeElement", {
        /**
         * Exposes the underlying native element.
         * Attention: This won't work in a webworker scenario!
         */
        get: function () { return this._renderer.getNativeElementSync(this); },
        enumerable: true,
        configurable: true
    });
    return ElementRef;
})();
exports.ElementRef = ElementRef;
