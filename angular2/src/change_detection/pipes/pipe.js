var lang_1 = require('angular2/src/facade/lang');
/**
 * Indicates that the result of a {@link Pipe} transformation has changed even though the reference
 *has not changed.
 *
 * The wrapped value will be unwrapped by change detection, and the unwrapped value will be stored.
 *
 * @exportedAs angular2/pipes
 */
var WrappedValue = (function () {
    function WrappedValue(wrapped) {
        this.wrapped = wrapped;
    }
    WrappedValue.wrap = function (value) {
        var w = _wrappedValues[_wrappedIndex++ % 5];
        w.wrapped = value;
        return w;
    };
    return WrappedValue;
})();
exports.WrappedValue = WrappedValue;
var _wrappedValues = [
    new WrappedValue(null),
    new WrappedValue(null),
    new WrappedValue(null),
    new WrappedValue(null),
    new WrappedValue(null)
];
var _wrappedIndex = 0;
/**
 * Provides default implementation of supports and onDestroy.
 *
 * #Example
 *
 * ```
 * class DoublePipe extends BasePipe {*
 *  transform(value) {
 *    return `${value}${value}`;
 *  }
 * }
 * ```
 */
var BasePipe = (function () {
    function BasePipe() {
    }
    BasePipe.prototype.supports = function (obj) { return true; };
    BasePipe.prototype.onDestroy = function () { };
    BasePipe.prototype.transform = function (value) { return _abstract(); };
    return BasePipe;
})();
exports.BasePipe = BasePipe;
function _abstract() {
    throw new lang_1.BaseException('This method is abstract');
}
