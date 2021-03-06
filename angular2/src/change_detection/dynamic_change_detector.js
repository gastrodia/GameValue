var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var lang_1 = require('angular2/src/facade/lang');
var collection_1 = require('angular2/src/facade/collection');
var abstract_change_detector_1 = require('./abstract_change_detector');
var change_detection_util_1 = require('./change_detection_util');
var proto_record_1 = require('./proto_record');
var exceptions_1 = require('./exceptions');
var DynamicChangeDetector = (function (_super) {
    __extends(DynamicChangeDetector, _super);
    function DynamicChangeDetector(id, changeControlStrategy, dispatcher, pipeRegistry, protos, directiveRecords) {
        _super.call(this, id);
        this.changeControlStrategy = changeControlStrategy;
        this.dispatcher = dispatcher;
        this.pipeRegistry = pipeRegistry;
        this.protos = protos;
        this.directiveRecords = directiveRecords;
        this.locals = null;
        this.directives = null;
        this.alreadyChecked = false;
        this.values = collection_1.ListWrapper.createFixedSize(protos.length + 1);
        this.pipes = collection_1.ListWrapper.createFixedSize(protos.length + 1);
        this.prevContexts = collection_1.ListWrapper.createFixedSize(protos.length + 1);
        this.changes = collection_1.ListWrapper.createFixedSize(protos.length + 1);
        this.values[0] = null;
        collection_1.ListWrapper.fill(this.values, change_detection_util_1.uninitialized, 1);
        collection_1.ListWrapper.fill(this.pipes, null);
        collection_1.ListWrapper.fill(this.prevContexts, change_detection_util_1.uninitialized);
        collection_1.ListWrapper.fill(this.changes, false);
    }
    DynamicChangeDetector.prototype.hydrate = function (context, locals, directives) {
        this.mode = change_detection_util_1.ChangeDetectionUtil.changeDetectionMode(this.changeControlStrategy);
        this.values[0] = context;
        this.locals = locals;
        this.directives = directives;
        this.alreadyChecked = false;
    };
    DynamicChangeDetector.prototype.dehydrate = function () {
        this._destroyPipes();
        this.values[0] = null;
        collection_1.ListWrapper.fill(this.values, change_detection_util_1.uninitialized, 1);
        collection_1.ListWrapper.fill(this.changes, false);
        collection_1.ListWrapper.fill(this.pipes, null);
        collection_1.ListWrapper.fill(this.prevContexts, change_detection_util_1.uninitialized);
        this.locals = null;
    };
    DynamicChangeDetector.prototype._destroyPipes = function () {
        for (var i = 0; i < this.pipes.length; ++i) {
            if (lang_1.isPresent(this.pipes[i])) {
                this.pipes[i].onDestroy();
            }
        }
    };
    DynamicChangeDetector.prototype.hydrated = function () { return this.values[0] !== null; };
    DynamicChangeDetector.prototype.detectChangesInRecords = function (throwOnChange) {
        if (!this.hydrated()) {
            change_detection_util_1.ChangeDetectionUtil.throwDehydrated();
        }
        var protos = this.protos;
        var changes = null;
        var isChanged = false;
        for (var i = 0; i < protos.length; ++i) {
            var proto = protos[i];
            var bindingRecord = proto.bindingRecord;
            var directiveRecord = bindingRecord.directiveRecord;
            if (proto.isLifeCycleRecord()) {
                if (proto.name === "onCheck" && !throwOnChange) {
                    this._getDirectiveFor(directiveRecord.directiveIndex).onCheck();
                }
                else if (proto.name === "onInit" && !throwOnChange && !this.alreadyChecked) {
                    this._getDirectiveFor(directiveRecord.directiveIndex).onInit();
                }
                else if (proto.name === "onChange" && lang_1.isPresent(changes) && !throwOnChange) {
                    this._getDirectiveFor(directiveRecord.directiveIndex).onChange(changes);
                }
            }
            else {
                var change = this._check(proto, throwOnChange);
                if (lang_1.isPresent(change)) {
                    this._updateDirectiveOrElement(change, bindingRecord);
                    isChanged = true;
                    changes = this._addChange(bindingRecord, change, changes);
                }
            }
            if (proto.lastInDirective) {
                changes = null;
                if (isChanged && bindingRecord.isOnPushChangeDetection()) {
                    this._getDetectorFor(directiveRecord.directiveIndex).markAsCheckOnce();
                }
                isChanged = false;
            }
        }
        this.alreadyChecked = true;
    };
    DynamicChangeDetector.prototype.callOnAllChangesDone = function () {
        this.dispatcher.notifyOnAllChangesDone();
        var dirs = this.directiveRecords;
        for (var i = dirs.length - 1; i >= 0; --i) {
            var dir = dirs[i];
            if (dir.callOnAllChangesDone) {
                this._getDirectiveFor(dir.directiveIndex).onAllChangesDone();
            }
        }
    };
    DynamicChangeDetector.prototype._updateDirectiveOrElement = function (change, bindingRecord) {
        if (lang_1.isBlank(bindingRecord.directiveRecord)) {
            this.dispatcher.notifyOnBinding(bindingRecord, change.currentValue);
        }
        else {
            var directiveIndex = bindingRecord.directiveRecord.directiveIndex;
            bindingRecord.setter(this._getDirectiveFor(directiveIndex), change.currentValue);
        }
    };
    DynamicChangeDetector.prototype._addChange = function (bindingRecord, change, changes) {
        if (bindingRecord.callOnChange()) {
            return change_detection_util_1.ChangeDetectionUtil.addChange(changes, bindingRecord.propertyName, change);
        }
        else {
            return changes;
        }
    };
    DynamicChangeDetector.prototype._getDirectiveFor = function (directiveIndex) { return this.directives.getDirectiveFor(directiveIndex); };
    DynamicChangeDetector.prototype._getDetectorFor = function (directiveIndex) { return this.directives.getDetectorFor(directiveIndex); };
    DynamicChangeDetector.prototype._check = function (proto, throwOnChange) {
        try {
            if (proto.isPipeRecord()) {
                return this._pipeCheck(proto, throwOnChange);
            }
            else {
                return this._referenceCheck(proto, throwOnChange);
            }
        }
        catch (e) {
            throw new exceptions_1.ChangeDetectionError(proto, e);
        }
    };
    DynamicChangeDetector.prototype._referenceCheck = function (proto, throwOnChange) {
        if (this._pureFuncAndArgsDidNotChange(proto)) {
            this._setChanged(proto, false);
            return null;
        }
        var prevValue = this._readSelf(proto);
        var currValue = this._calculateCurrValue(proto);
        if (!isSame(prevValue, currValue)) {
            if (proto.lastInBinding) {
                var change = change_detection_util_1.ChangeDetectionUtil.simpleChange(prevValue, currValue);
                if (throwOnChange)
                    change_detection_util_1.ChangeDetectionUtil.throwOnChange(proto, change);
                this._writeSelf(proto, currValue);
                this._setChanged(proto, true);
                return change;
            }
            else {
                this._writeSelf(proto, currValue);
                this._setChanged(proto, true);
                return null;
            }
        }
        else {
            this._setChanged(proto, false);
            return null;
        }
    };
    DynamicChangeDetector.prototype._calculateCurrValue = function (proto) {
        switch (proto.mode) {
            case proto_record_1.RecordType.SELF:
                return this._readContext(proto);
            case proto_record_1.RecordType.CONST:
                return proto.funcOrValue;
            case proto_record_1.RecordType.PROPERTY:
                var context = this._readContext(proto);
                return proto.funcOrValue(context);
            case proto_record_1.RecordType.SAFE_PROPERTY:
                var context = this._readContext(proto);
                return lang_1.isBlank(context) ? null : proto.funcOrValue(context);
            case proto_record_1.RecordType.LOCAL:
                return this.locals.get(proto.name);
            case proto_record_1.RecordType.INVOKE_METHOD:
                var context = this._readContext(proto);
                var args = this._readArgs(proto);
                return proto.funcOrValue(context, args);
            case proto_record_1.RecordType.SAFE_INVOKE_METHOD:
                var context = this._readContext(proto);
                if (lang_1.isBlank(context)) {
                    return null;
                }
                var args = this._readArgs(proto);
                return proto.funcOrValue(context, args);
            case proto_record_1.RecordType.KEYED_ACCESS:
                var arg = this._readArgs(proto)[0];
                return this._readContext(proto)[arg];
            case proto_record_1.RecordType.INVOKE_CLOSURE:
                return lang_1.FunctionWrapper.apply(this._readContext(proto), this._readArgs(proto));
            case proto_record_1.RecordType.INTERPOLATE:
            case proto_record_1.RecordType.PRIMITIVE_OP:
                return lang_1.FunctionWrapper.apply(proto.funcOrValue, this._readArgs(proto));
            default:
                throw new lang_1.BaseException("Unknown operation " + proto.mode);
        }
    };
    DynamicChangeDetector.prototype._pipeCheck = function (proto, throwOnChange) {
        var context = this._readContext(proto);
        var pipe = this._pipeFor(proto, context);
        var prevValue = this._readSelf(proto);
        var currValue = pipe.transform(context);
        if (!isSame(prevValue, currValue)) {
            currValue = change_detection_util_1.ChangeDetectionUtil.unwrapValue(currValue);
            if (proto.lastInBinding) {
                var change = change_detection_util_1.ChangeDetectionUtil.simpleChange(prevValue, currValue);
                if (throwOnChange)
                    change_detection_util_1.ChangeDetectionUtil.throwOnChange(proto, change);
                this._writeSelf(proto, currValue);
                this._setChanged(proto, true);
                return change;
            }
            else {
                this._writeSelf(proto, currValue);
                this._setChanged(proto, true);
                return null;
            }
        }
        else {
            this._setChanged(proto, false);
            return null;
        }
    };
    DynamicChangeDetector.prototype._pipeFor = function (proto, context) {
        var storedPipe = this._readPipe(proto);
        if (lang_1.isPresent(storedPipe) && storedPipe.supports(context)) {
            return storedPipe;
        }
        if (lang_1.isPresent(storedPipe)) {
            storedPipe.onDestroy();
        }
        var pipe = this.pipeRegistry.get(proto.name, context, this.ref);
        this._writePipe(proto, pipe);
        return pipe;
    };
    DynamicChangeDetector.prototype._readContext = function (proto) {
        if (proto.contextIndex == -1) {
            return this._getDirectiveFor(proto.directiveIndex);
        }
        else {
            return this.values[proto.contextIndex];
        }
        return this.values[proto.contextIndex];
    };
    DynamicChangeDetector.prototype._readSelf = function (proto) { return this.values[proto.selfIndex]; };
    DynamicChangeDetector.prototype._writeSelf = function (proto, value) { this.values[proto.selfIndex] = value; };
    DynamicChangeDetector.prototype._readPipe = function (proto) { return this.pipes[proto.selfIndex]; };
    DynamicChangeDetector.prototype._writePipe = function (proto, value) { this.pipes[proto.selfIndex] = value; };
    DynamicChangeDetector.prototype._setChanged = function (proto, value) { this.changes[proto.selfIndex] = value; };
    DynamicChangeDetector.prototype._pureFuncAndArgsDidNotChange = function (proto) {
        return proto.isPureFunction() && !this._argsChanged(proto);
    };
    DynamicChangeDetector.prototype._argsChanged = function (proto) {
        var args = proto.args;
        for (var i = 0; i < args.length; ++i) {
            if (this.changes[args[i]]) {
                return true;
            }
        }
        return false;
    };
    DynamicChangeDetector.prototype._readArgs = function (proto) {
        var res = collection_1.ListWrapper.createFixedSize(proto.args.length);
        var args = proto.args;
        for (var i = 0; i < args.length; ++i) {
            res[i] = this.values[args[i]];
        }
        return res;
    };
    return DynamicChangeDetector;
})(abstract_change_detector_1.AbstractChangeDetector);
exports.DynamicChangeDetector = DynamicChangeDetector;
function isSame(a, b) {
    if (a === b)
        return true;
    if (a instanceof String && b instanceof String && a == b)
        return true;
    if ((a !== a) && (b !== b))
        return true;
    return false;
}
