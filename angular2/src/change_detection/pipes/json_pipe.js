var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var lang_1 = require('angular2/src/facade/lang');
var pipe_1 = require('./pipe');
/**
 * Implements json transforms to any object.
 *
 * # Example
 *
 * In this example we transform the user object to json.
 *
 *  ```
 * @Component({
 *   selector: "user-cmp"
 * })
 * @View({
 *   template: "User: {{ user | json }}"
 * })
 * class Username {
 *  user:Object
 *  constructor() {
 *    this.user = { name: "PatrickJS" };
 *  }
 * }
 *
 * ```
 *
 * @exportedAs angular2/pipes
 */
var JsonPipe = (function (_super) {
    __extends(JsonPipe, _super);
    function JsonPipe() {
        _super.apply(this, arguments);
    }
    JsonPipe.prototype.transform = function (value) { return lang_1.Json.stringify(value); };
    JsonPipe.prototype.create = function (cdRef) { return this; };
    return JsonPipe;
})(pipe_1.BasePipe);
exports.JsonPipe = JsonPipe;
