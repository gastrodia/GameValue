var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var jit_proto_change_detector_1 = require('./jit_proto_change_detector');
var pregen_proto_change_detector_1 = require('./pregen_proto_change_detector');
var proto_change_detector_1 = require('./proto_change_detector');
var pipe_registry_1 = require('./pipes/pipe_registry');
var iterable_changes_1 = require('./pipes/iterable_changes');
var keyvalue_changes_1 = require('./pipes/keyvalue_changes');
var observable_pipe_1 = require('./pipes/observable_pipe');
var promise_pipe_1 = require('./pipes/promise_pipe');
var uppercase_pipe_1 = require('./pipes/uppercase_pipe');
var lowercase_pipe_1 = require('./pipes/lowercase_pipe');
var json_pipe_1 = require('./pipes/json_pipe');
var null_pipe_1 = require('./pipes/null_pipe');
var interfaces_1 = require('./interfaces');
var di_1 = require('angular2/di');
var collection_1 = require('angular2/src/facade/collection');
var lang_1 = require('angular2/src/facade/lang');
/**
 * Structural diffing for `Object`s and `Map`s.
 *
 * @exportedAs angular2/pipes
 */
exports.keyValDiff = [new keyvalue_changes_1.KeyValueChangesFactory(), new null_pipe_1.NullPipeFactory()];
/**
 * Structural diffing for `Iterable` types such as `Array`s.
 *
 * @exportedAs angular2/pipes
 */
exports.iterableDiff = [new iterable_changes_1.IterableChangesFactory(), new null_pipe_1.NullPipeFactory()];
/**
 * Async binding to such types as Observable.
 *
 * @exportedAs angular2/pipes
 */
exports.async = [new observable_pipe_1.ObservablePipeFactory(), new promise_pipe_1.PromisePipeFactory(), new null_pipe_1.NullPipeFactory()];
/**
 * Uppercase text transform.
 *
 * @exportedAs angular2/pipes
 */
exports.uppercase = [new uppercase_pipe_1.UpperCaseFactory(), new null_pipe_1.NullPipeFactory()];
/**
 * Lowercase text transform.
 *
 * @exportedAs angular2/pipes
 */
exports.lowercase = [new lowercase_pipe_1.LowerCaseFactory(), new null_pipe_1.NullPipeFactory()];
/**
 * Json stringify transform.
 *
 * @exportedAs angular2/pipes
 */
exports.json = [new json_pipe_1.JsonPipe(), new null_pipe_1.NullPipeFactory()];
exports.defaultPipes = {
    "iterableDiff": exports.iterableDiff,
    "keyValDiff": exports.keyValDiff,
    "async": exports.async,
    "uppercase": exports.uppercase,
    "lowercase": exports.lowercase,
    "json": exports.json
};
/**
 * Map from {@link ChangeDetectorDefinition#id} to a factory method which takes a
 * {@link PipeRegistry} and a {@link ChangeDetectorDefinition} and generates a
 * {@link ProtoChangeDetector} associated with the definition.
 */
// TODO(kegluneq): Use PregenProtoChangeDetectorFactory rather than Function once possible in
// dart2js. See https://github.com/dart-lang/sdk/issues/23630 for details.
exports.preGeneratedProtoDetectors = {};
exports.PROTO_CHANGE_DETECTOR_KEY = lang_1.CONST_EXPR(new di_1.OpaqueToken('ProtoChangeDetectors'));
/**
 * Implements change detection using a map of pregenerated proto detectors.
 *
 * @exportedAs angular2/change_detection
 */
var PreGeneratedChangeDetection = (function (_super) {
    __extends(PreGeneratedChangeDetection, _super);
    function PreGeneratedChangeDetection(registry, protoChangeDetectorsForTest) {
        _super.call(this);
        this.registry = registry;
        this._dynamicChangeDetection = new DynamicChangeDetection(registry);
        this._protoChangeDetectorFactories = lang_1.isPresent(protoChangeDetectorsForTest) ?
            protoChangeDetectorsForTest :
            exports.preGeneratedProtoDetectors;
    }
    PreGeneratedChangeDetection.isSupported = function () { return pregen_proto_change_detector_1.PregenProtoChangeDetector.isSupported(); };
    PreGeneratedChangeDetection.prototype.createProtoChangeDetector = function (definition) {
        var id = definition.id;
        if (collection_1.StringMapWrapper.contains(this._protoChangeDetectorFactories, id)) {
            return collection_1.StringMapWrapper.get(this._protoChangeDetectorFactories, id)(this.registry, definition);
        }
        return this._dynamicChangeDetection.createProtoChangeDetector(definition);
    };
    PreGeneratedChangeDetection = __decorate([
        di_1.Injectable(),
        __param(1, di_1.Inject(exports.PROTO_CHANGE_DETECTOR_KEY)),
        __param(1, di_1.Optional()), 
        __metadata('design:paramtypes', [PipeRegistry, Object])
    ], PreGeneratedChangeDetection);
    return PreGeneratedChangeDetection;
})(interfaces_1.ChangeDetection);
exports.PreGeneratedChangeDetection = PreGeneratedChangeDetection;
/**
 * Implements change detection that does not require `eval()`.
 *
 * This is slower than {@link JitChangeDetection}.
 *
 * @exportedAs angular2/change_detection
 */
var DynamicChangeDetection = (function (_super) {
    __extends(DynamicChangeDetection, _super);
    function DynamicChangeDetection(registry) {
        _super.call(this);
        this.registry = registry;
    }
    DynamicChangeDetection.prototype.createProtoChangeDetector = function (definition) {
        return new proto_change_detector_1.DynamicProtoChangeDetector(this.registry, definition);
    };
    DynamicChangeDetection = __decorate([
        di_1.Injectable(), 
        __metadata('design:paramtypes', [PipeRegistry])
    ], DynamicChangeDetection);
    return DynamicChangeDetection;
})(interfaces_1.ChangeDetection);
exports.DynamicChangeDetection = DynamicChangeDetection;
/**
 * Implements faster change detection by generating source code.
 *
 * This requires `eval()`. For change detection that does not require `eval()`, see
 * {@link DynamicChangeDetection} and {@link PreGeneratedChangeDetection}.
 *
 * @exportedAs angular2/change_detection
 */
var JitChangeDetection = (function (_super) {
    __extends(JitChangeDetection, _super);
    function JitChangeDetection(registry) {
        _super.call(this);
        this.registry = registry;
    }
    JitChangeDetection.isSupported = function () { return jit_proto_change_detector_1.JitProtoChangeDetector.isSupported(); };
    JitChangeDetection.prototype.createProtoChangeDetector = function (definition) {
        return new jit_proto_change_detector_1.JitProtoChangeDetector(this.registry, definition);
    };
    JitChangeDetection = __decorate([
        di_1.Injectable(), 
        __metadata('design:paramtypes', [PipeRegistry])
    ], JitChangeDetection);
    return JitChangeDetection;
})(interfaces_1.ChangeDetection);
exports.JitChangeDetection = JitChangeDetection;
exports.defaultPipeRegistry = new pipe_registry_1.PipeRegistry(exports.defaultPipes);
