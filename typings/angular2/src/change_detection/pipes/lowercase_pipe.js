var lang_1 = require('angular2/src/facade/lang');
/**
 * Implements lowercase transforms to text.
 *
 * # Example
 *
 * In this example we transform the user text lowercase.
 *
 *  ```
 * @Component({
 *   selector: "username-cmp"
 * })
 * @View({
 *   template: "Username: {{ user | lowercase }}"
 * })
 * class Username {
 *   user:string;
 * }
 *
 * ```
 *
 * @exportedAs angular2/pipes
 */
var LowerCasePipe = (function () {
    function LowerCasePipe() {
        this._latestValue = null;
    }
    LowerCasePipe.prototype.supports = function (str) { return lang_1.isString(str); };
    LowerCasePipe.prototype.onDestroy = function () { this._latestValue = null; };
    LowerCasePipe.prototype.transform = function (value) {
        if (this._latestValue !== value) {
            this._latestValue = value;
            return lang_1.StringWrapper.toLowerCase(value);
        }
        else {
            return this._latestValue;
        }
    };
    return LowerCasePipe;
})();
exports.LowerCasePipe = LowerCasePipe;
/**
 * @exportedAs angular2/pipes
 */
var LowerCaseFactory = (function () {
    function LowerCaseFactory() {
    }
    LowerCaseFactory.prototype.supports = function (str) { return lang_1.isString(str); };
    LowerCaseFactory.prototype.create = function () { return new LowerCasePipe(); };
    return LowerCaseFactory;
})();
exports.LowerCaseFactory = LowerCaseFactory;
