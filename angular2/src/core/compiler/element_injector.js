var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var lang_1 = require('angular2/src/facade/lang');
var async_1 = require('angular2/src/facade/async');
var collection_1 = require('angular2/src/facade/collection');
var di_1 = require('angular2/di');
var visibility_1 = require('angular2/src/core/annotations_impl/visibility');
var di_2 = require('angular2/src/core/annotations_impl/di');
var avmModule = require('./view_manager');
var view_container_ref_1 = require('./view_container_ref');
var element_ref_1 = require('./element_ref');
var view_ref_1 = require('./view_ref');
var annotations_1 = require('angular2/src/core/annotations_impl/annotations');
var directive_lifecycle_reflector_1 = require('./directive_lifecycle_reflector');
var change_detection_1 = require('angular2/change_detection');
var query_list_1 = require('./query_list');
var reflection_1 = require('angular2/src/reflection/reflection');
var api_1 = require('angular2/src/render/api');
// Threshold for the dynamic version
var _MAX_DIRECTIVE_CONSTRUCTION_COUNTER = 10;
var _undefined = lang_1.CONST_EXPR(new Object());
var _staticKeys;
var StaticKeys = (function () {
    function StaticKeys() {
        // TODO: vsavkin Key.annotate(Key.get(AppView), 'static')
        this.viewManagerId = di_1.Key.get(avmModule.AppViewManager).id;
        this.protoViewId = di_1.Key.get(view_ref_1.ProtoViewRef).id;
        this.viewContainerId = di_1.Key.get(view_container_ref_1.ViewContainerRef).id;
        this.changeDetectorRefId = di_1.Key.get(change_detection_1.ChangeDetectorRef).id;
        this.elementRefId = di_1.Key.get(element_ref_1.ElementRef).id;
    }
    StaticKeys.instance = function () {
        if (lang_1.isBlank(_staticKeys))
            _staticKeys = new StaticKeys();
        return _staticKeys;
    };
    return StaticKeys;
})();
var TreeNode = (function () {
    function TreeNode(parent) {
        this._head = null;
        this._tail = null;
        this._next = null;
        if (lang_1.isPresent(parent))
            parent.addChild(this);
    }
    /**
     * Adds a child to the parent node. The child MUST NOT be a part of a tree.
     */
    TreeNode.prototype.addChild = function (child) {
        if (lang_1.isPresent(this._tail)) {
            this._tail._next = child;
            this._tail = child;
        }
        else {
            this._tail = this._head = child;
        }
        child._next = null;
        child._parent = this;
    };
    /**
     * Adds a child to the parent node after a given sibling.
     * The child MUST NOT be a part of a tree and the sibling must be present.
     */
    TreeNode.prototype.addChildAfter = function (child, prevSibling) {
        if (lang_1.isBlank(prevSibling)) {
            var prevHead = this._head;
            this._head = child;
            child._next = prevHead;
            if (lang_1.isBlank(this._tail))
                this._tail = child;
        }
        else if (lang_1.isBlank(prevSibling._next)) {
            this.addChild(child);
            return;
        }
        else {
            child._next = prevSibling._next;
            prevSibling._next = child;
        }
        child._parent = this;
    };
    /**
     * Detaches a node from the parent's tree.
     */
    TreeNode.prototype.remove = function () {
        if (lang_1.isBlank(this.parent))
            return;
        var nextSibling = this._next;
        var prevSibling = this._findPrev();
        if (lang_1.isBlank(prevSibling)) {
            this.parent._head = this._next;
        }
        else {
            prevSibling._next = this._next;
        }
        if (lang_1.isBlank(nextSibling)) {
            this._parent._tail = prevSibling;
        }
        this._parent = null;
        this._next = null;
    };
    /**
     * Finds a previous sibling or returns null if first child.
     * Assumes the node has a parent.
     * TODO(rado): replace with DoublyLinkedList to avoid O(n) here.
     */
    TreeNode.prototype._findPrev = function () {
        var node = this.parent._head;
        if (node == this)
            return null;
        while (node._next !== this)
            node = node._next;
        return node;
    };
    Object.defineProperty(TreeNode.prototype, "parent", {
        get: function () { return this._parent; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(TreeNode.prototype, "children", {
        // TODO(rado): replace with a function call, does too much work for a getter.
        get: function () {
            var res = [];
            var child = this._head;
            while (child != null) {
                res.push(child);
                child = child._next;
            }
            return res;
        },
        enumerable: true,
        configurable: true
    });
    return TreeNode;
})();
exports.TreeNode = TreeNode;
var DependencyWithVisibility = (function (_super) {
    __extends(DependencyWithVisibility, _super);
    function DependencyWithVisibility(key, asPromise, lazy, optional, properties, visibility) {
        _super.call(this, key, asPromise, lazy, optional, properties);
        this.visibility = visibility;
    }
    DependencyWithVisibility.createFrom = function (d) {
        return new DependencyWithVisibility(d.key, d.asPromise, d.lazy, d.optional, d.properties, DependencyWithVisibility._visibility(d.properties));
    };
    DependencyWithVisibility._visibility = function (properties) {
        if (properties.length == 0)
            return visibility_1.self;
        var p = collection_1.ListWrapper.find(properties, function (p) { return p instanceof visibility_1.Visibility; });
        return lang_1.isPresent(p) ? p : visibility_1.self;
    };
    return DependencyWithVisibility;
})(di_1.Dependency);
exports.DependencyWithVisibility = DependencyWithVisibility;
var DirectiveDependency = (function (_super) {
    __extends(DirectiveDependency, _super);
    function DirectiveDependency(key, asPromise, lazy, optional, properties, visibility, attributeName, queryDecorator) {
        _super.call(this, key, asPromise, lazy, optional, properties, visibility);
        this.attributeName = attributeName;
        this.queryDecorator = queryDecorator;
        this._verify();
    }
    DirectiveDependency.prototype._verify = function () {
        var count = 0;
        if (lang_1.isPresent(this.queryDecorator))
            count++;
        if (lang_1.isPresent(this.attributeName))
            count++;
        if (count > 1)
            throw new lang_1.BaseException('A directive injectable can contain only one of the following @Attribute or @Query.');
    };
    DirectiveDependency.createFrom = function (d) {
        return new DirectiveDependency(d.key, d.asPromise, d.lazy, d.optional, d.properties, DependencyWithVisibility._visibility(d.properties), DirectiveDependency._attributeName(d.properties), DirectiveDependency._query(d.properties));
    };
    DirectiveDependency._attributeName = function (properties) {
        var p = collection_1.ListWrapper.find(properties, function (p) { return p instanceof di_2.Attribute; });
        return lang_1.isPresent(p) ? p.attributeName : null;
    };
    DirectiveDependency._query = function (properties) { return collection_1.ListWrapper.find(properties, function (p) { return p instanceof di_2.Query; }); };
    return DirectiveDependency;
})(DependencyWithVisibility);
exports.DirectiveDependency = DirectiveDependency;
var DirectiveBinding = (function (_super) {
    __extends(DirectiveBinding, _super);
    function DirectiveBinding(key, factory, dependencies, providedAsPromise, resolvedAppInjectables, resolvedHostInjectables, resolvedViewInjectables, metadata) {
        _super.call(this, key, factory, dependencies, providedAsPromise);
        this.resolvedAppInjectables = resolvedAppInjectables;
        this.resolvedHostInjectables = resolvedHostInjectables;
        this.resolvedViewInjectables = resolvedViewInjectables;
        this.metadata = metadata;
    }
    Object.defineProperty(DirectiveBinding.prototype, "callOnDestroy", {
        get: function () { return this.metadata.callOnDestroy; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(DirectiveBinding.prototype, "callOnChange", {
        get: function () { return this.metadata.callOnChange; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(DirectiveBinding.prototype, "callOnAllChangesDone", {
        get: function () { return this.metadata.callOnAllChangesDone; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(DirectiveBinding.prototype, "displayName", {
        get: function () { return this.key.displayName; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(DirectiveBinding.prototype, "eventEmitters", {
        get: function () {
            return lang_1.isPresent(this.metadata) && lang_1.isPresent(this.metadata.events) ? this.metadata.events : [];
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(DirectiveBinding.prototype, "hostActions", {
        get: function () {
            return lang_1.isPresent(this.metadata) && lang_1.isPresent(this.metadata.hostActions) ?
                this.metadata.hostActions :
                new Map();
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(DirectiveBinding.prototype, "changeDetection", {
        get: function () { return this.metadata.changeDetection; },
        enumerable: true,
        configurable: true
    });
    DirectiveBinding.createFromBinding = function (binding, ann) {
        if (lang_1.isBlank(ann)) {
            ann = new annotations_1.Directive();
        }
        var rb = binding.resolve();
        var deps = collection_1.ListWrapper.map(rb.dependencies, DirectiveDependency.createFrom);
        var resolvedAppInjectables = ann instanceof annotations_1.Component && lang_1.isPresent(ann.appInjector) ?
            di_1.Injector.resolve(ann.appInjector) :
            [];
        var resolvedHostInjectables = lang_1.isPresent(ann.hostInjector) ? di_1.resolveBindings(ann.hostInjector) : [];
        var resolvedViewInjectables = ann instanceof annotations_1.Component && lang_1.isPresent(ann.viewInjector) ?
            di_1.resolveBindings(ann.viewInjector) :
            [];
        var metadata = api_1.DirectiveMetadata.create({
            id: lang_1.stringify(rb.key.token),
            type: ann instanceof
                annotations_1.Component ? api_1.DirectiveMetadata.COMPONENT_TYPE : api_1.DirectiveMetadata.DIRECTIVE_TYPE,
            selector: ann.selector,
            compileChildren: ann.compileChildren,
            events: ann.events,
            host: lang_1.isPresent(ann.host) ? collection_1.MapWrapper.createFromStringMap(ann.host) : null,
            properties: ann.properties,
            readAttributes: DirectiveBinding._readAttributes(deps),
            callOnDestroy: directive_lifecycle_reflector_1.hasLifecycleHook(annotations_1.onDestroy, rb.key.token, ann),
            callOnChange: directive_lifecycle_reflector_1.hasLifecycleHook(annotations_1.onChange, rb.key.token, ann),
            callOnCheck: directive_lifecycle_reflector_1.hasLifecycleHook(annotations_1.onCheck, rb.key.token, ann),
            callOnInit: directive_lifecycle_reflector_1.hasLifecycleHook(annotations_1.onInit, rb.key.token, ann),
            callOnAllChangesDone: directive_lifecycle_reflector_1.hasLifecycleHook(annotations_1.onAllChangesDone, rb.key.token, ann),
            changeDetection: ann instanceof
                annotations_1.Component ? ann.changeDetection : null,
            exportAs: ann.exportAs
        });
        return new DirectiveBinding(rb.key, rb.factory, deps, rb.providedAsPromise, resolvedAppInjectables, resolvedHostInjectables, resolvedViewInjectables, metadata);
    };
    DirectiveBinding._readAttributes = function (deps) {
        var readAttributes = [];
        collection_1.ListWrapper.forEach(deps, function (dep) {
            if (lang_1.isPresent(dep.attributeName)) {
                readAttributes.push(dep.attributeName);
            }
        });
        return readAttributes;
    };
    DirectiveBinding.createFromType = function (type, annotation) {
        var binding = new di_1.Binding(type, { toClass: type });
        return DirectiveBinding.createFromBinding(binding, annotation);
    };
    return DirectiveBinding;
})(di_1.ResolvedBinding);
exports.DirectiveBinding = DirectiveBinding;
// TODO(rado): benchmark and consider rolling in as ElementInjector fields.
var PreBuiltObjects = (function () {
    function PreBuiltObjects(viewManager, view, protoView) {
        this.viewManager = viewManager;
        this.view = view;
        this.protoView = protoView;
    }
    return PreBuiltObjects;
})();
exports.PreBuiltObjects = PreBuiltObjects;
var EventEmitterAccessor = (function () {
    function EventEmitterAccessor(eventName, getter) {
        this.eventName = eventName;
        this.getter = getter;
    }
    EventEmitterAccessor.prototype.subscribe = function (view, boundElementIndex, directive) {
        var _this = this;
        var eventEmitter = this.getter(directive);
        return async_1.ObservableWrapper.subscribe(eventEmitter, function (eventObj) { return view.triggerEventHandlers(_this.eventName, eventObj, boundElementIndex); });
    };
    return EventEmitterAccessor;
})();
exports.EventEmitterAccessor = EventEmitterAccessor;
var HostActionAccessor = (function () {
    function HostActionAccessor(methodName, getter) {
        this.methodName = methodName;
        this.getter = getter;
    }
    HostActionAccessor.prototype.subscribe = function (view, boundElementIndex, directive) {
        var _this = this;
        var eventEmitter = this.getter(directive);
        return async_1.ObservableWrapper.subscribe(eventEmitter, function (actionArgs) { return view.invokeElementMethod(boundElementIndex, _this.methodName, actionArgs); });
    };
    return HostActionAccessor;
})();
exports.HostActionAccessor = HostActionAccessor;
var LIGHT_DOM = 1;
var SHADOW_DOM = 2;
var LIGHT_DOM_AND_SHADOW_DOM = 3;
var BindingData = (function () {
    function BindingData(binding, visibility) {
        this.binding = binding;
        this.visibility = visibility;
    }
    BindingData.prototype.getKeyId = function () { return this.binding.key.id; };
    BindingData.prototype.createEventEmitterAccessors = function () {
        if (!(this.binding instanceof DirectiveBinding))
            return [];
        var db = this.binding;
        return collection_1.ListWrapper.map(db.eventEmitters, function (eventConfig) {
            var fieldName;
            var eventName;
            var colonIdx = eventConfig.indexOf(':');
            if (colonIdx > -1) {
                // long format: 'fieldName: eventName'
                fieldName = lang_1.StringWrapper.substring(eventConfig, 0, colonIdx).trim();
                eventName = lang_1.StringWrapper.substring(eventConfig, colonIdx + 1).trim();
            }
            else {
                // short format: 'name' when fieldName and eventName are the same
                fieldName = eventName = eventConfig;
            }
            return new EventEmitterAccessor(eventName, reflection_1.reflector.getter(fieldName));
        });
    };
    BindingData.prototype.createHostActionAccessors = function () {
        if (!(this.binding instanceof DirectiveBinding))
            return [];
        var res = [];
        var db = this.binding;
        collection_1.MapWrapper.forEach(db.hostActions, function (actionExpression, actionName) {
            res.push(new HostActionAccessor(actionExpression, reflection_1.reflector.getter(actionName)));
        });
        return res;
    };
    return BindingData;
})();
exports.BindingData = BindingData;
/**

Difference between di.Injector and ElementInjector

di.Injector:
 - imperative based (can create child injectors imperativly)
 - Lazy loading of code
 - Component/App Level services which are usually not DOM Related.


ElementInjector:
  - ProtoBased (Injector structure fixed at compile time)
  - understands @Ancestor, @Parent, @Child, @Descendent
  - Fast
  - Query mechanism for children
  - 1:1 to DOM structure.

 PERF BENCHMARK:
http://www.williambrownstreet.net/blog/2014/04/faster-angularjs-rendering-angularjs-and-reactjs/
 */
var ProtoElementInjector = (function () {
    function ProtoElementInjector(parent, index, bd, distanceToParent, _firstBindingIsComponent, directiveVariableBindings) {
        this.parent = parent;
        this.index = index;
        this.distanceToParent = distanceToParent;
        this._firstBindingIsComponent = _firstBindingIsComponent;
        this.directiveVariableBindings = directiveVariableBindings;
        var length = bd.length;
        this.eventEmitterAccessors = collection_1.ListWrapper.createFixedSize(length);
        this.hostActionAccessors = collection_1.ListWrapper.createFixedSize(length);
        this._strategy = length > _MAX_DIRECTIVE_CONSTRUCTION_COUNTER ?
            new _ProtoElementInjectorDynamicStrategy(this, bd) :
            new _ProtoElementInjectorInlineStrategy(this, bd);
    }
    ProtoElementInjector.create = function (parent, index, bindings, firstBindingIsComponent, distanceToParent, directiveVariableBindings) {
        var bd = [];
        ProtoElementInjector._createDirectiveBindingData(bindings, bd, firstBindingIsComponent);
        if (firstBindingIsComponent) {
            ProtoElementInjector._createViewInjectorBindingData(bindings, bd);
        }
        ProtoElementInjector._createHostInjectorBindingData(bindings, bd, firstBindingIsComponent);
        return new ProtoElementInjector(parent, index, bd, distanceToParent, firstBindingIsComponent, directiveVariableBindings);
    };
    ProtoElementInjector._createDirectiveBindingData = function (dirBindings, bd, firstBindingIsComponent) {
        collection_1.ListWrapper.forEach(dirBindings, function (dirBinding) {
            bd.push(ProtoElementInjector._createBindingData(firstBindingIsComponent, dirBinding, dirBindings, dirBinding));
        });
    };
    ProtoElementInjector._createHostInjectorBindingData = function (dirBindings, bd, firstBindingIsComponent) {
        collection_1.ListWrapper.forEach(dirBindings, function (dirBinding) {
            collection_1.ListWrapper.forEach(dirBinding.resolvedHostInjectables, function (b) {
                bd.push(ProtoElementInjector._createBindingData(firstBindingIsComponent, dirBinding, dirBindings, ProtoElementInjector._createBinding(b)));
            });
        });
    };
    ProtoElementInjector._createBindingData = function (firstBindingIsComponent, dirBinding, dirBindings, binding) {
        var isComponent = firstBindingIsComponent && dirBindings[0] === dirBinding;
        return new BindingData(binding, isComponent ? LIGHT_DOM_AND_SHADOW_DOM : LIGHT_DOM);
    };
    ProtoElementInjector._createViewInjectorBindingData = function (bindings, bd) {
        var db = bindings[0];
        collection_1.ListWrapper.forEach(db.resolvedViewInjectables, function (b) { return bd.push(new BindingData(ProtoElementInjector._createBinding(b), SHADOW_DOM)); });
    };
    ProtoElementInjector._createBinding = function (b) {
        var deps = collection_1.ListWrapper.map(b.dependencies, function (d) { return DependencyWithVisibility.createFrom(d); });
        return new di_1.ResolvedBinding(b.key, b.factory, deps, b.providedAsPromise);
    };
    ProtoElementInjector.prototype.instantiate = function (parent) {
        return new ElementInjector(this, parent);
    };
    ProtoElementInjector.prototype.directParent = function () { return this.distanceToParent < 2 ? this.parent : null; };
    Object.defineProperty(ProtoElementInjector.prototype, "hasBindings", {
        get: function () { return this._strategy.hasBindings(); },
        enumerable: true,
        configurable: true
    });
    ProtoElementInjector.prototype.getBindingAtIndex = function (index) { return this._strategy.getBindingAtIndex(index); };
    return ProtoElementInjector;
})();
exports.ProtoElementInjector = ProtoElementInjector;
/**
 * Strategy used by the `ProtoElementInjector` when the number of bindings is 10 or less.
 * In such a case, inlining fields is benefitial for performances.
 */
var _ProtoElementInjectorInlineStrategy = (function () {
    function _ProtoElementInjectorInlineStrategy(protoEI, bd) {
        // only _binding0 can contain a component
        this._binding0 = null;
        this._binding1 = null;
        this._binding2 = null;
        this._binding3 = null;
        this._binding4 = null;
        this._binding5 = null;
        this._binding6 = null;
        this._binding7 = null;
        this._binding8 = null;
        this._binding9 = null;
        this._keyId0 = null;
        this._keyId1 = null;
        this._keyId2 = null;
        this._keyId3 = null;
        this._keyId4 = null;
        this._keyId5 = null;
        this._keyId6 = null;
        this._keyId7 = null;
        this._keyId8 = null;
        this._keyId9 = null;
        this._visibility0 = null;
        this._visibility1 = null;
        this._visibility2 = null;
        this._visibility3 = null;
        this._visibility4 = null;
        this._visibility5 = null;
        this._visibility6 = null;
        this._visibility7 = null;
        this._visibility8 = null;
        this._visibility9 = null;
        var length = bd.length;
        if (length > 0) {
            this._binding0 = bd[0].binding;
            this._keyId0 = bd[0].getKeyId();
            this._visibility0 = bd[0].visibility;
            protoEI.eventEmitterAccessors[0] = bd[0].createEventEmitterAccessors();
            protoEI.hostActionAccessors[0] = bd[0].createHostActionAccessors();
        }
        if (length > 1) {
            this._binding1 = bd[1].binding;
            this._keyId1 = bd[1].getKeyId();
            this._visibility1 = bd[1].visibility;
            protoEI.eventEmitterAccessors[1] = bd[1].createEventEmitterAccessors();
            protoEI.hostActionAccessors[1] = bd[1].createHostActionAccessors();
        }
        if (length > 2) {
            this._binding2 = bd[2].binding;
            this._keyId2 = bd[2].getKeyId();
            this._visibility2 = bd[2].visibility;
            protoEI.eventEmitterAccessors[2] = bd[2].createEventEmitterAccessors();
            protoEI.hostActionAccessors[2] = bd[2].createHostActionAccessors();
        }
        if (length > 3) {
            this._binding3 = bd[3].binding;
            this._keyId3 = bd[3].getKeyId();
            this._visibility3 = bd[3].visibility;
            protoEI.eventEmitterAccessors[3] = bd[3].createEventEmitterAccessors();
            protoEI.hostActionAccessors[3] = bd[3].createHostActionAccessors();
        }
        if (length > 4) {
            this._binding4 = bd[4].binding;
            this._keyId4 = bd[4].getKeyId();
            this._visibility4 = bd[4].visibility;
            protoEI.eventEmitterAccessors[4] = bd[4].createEventEmitterAccessors();
            protoEI.hostActionAccessors[4] = bd[4].createHostActionAccessors();
        }
        if (length > 5) {
            this._binding5 = bd[5].binding;
            this._keyId5 = bd[5].getKeyId();
            this._visibility5 = bd[5].visibility;
            protoEI.eventEmitterAccessors[5] = bd[5].createEventEmitterAccessors();
            protoEI.hostActionAccessors[5] = bd[5].createHostActionAccessors();
        }
        if (length > 6) {
            this._binding6 = bd[6].binding;
            this._keyId6 = bd[6].getKeyId();
            this._visibility6 = bd[6].visibility;
            protoEI.eventEmitterAccessors[6] = bd[6].createEventEmitterAccessors();
            protoEI.hostActionAccessors[6] = bd[6].createHostActionAccessors();
        }
        if (length > 7) {
            this._binding7 = bd[7].binding;
            this._keyId7 = bd[7].getKeyId();
            this._visibility7 = bd[7].visibility;
            protoEI.eventEmitterAccessors[7] = bd[7].createEventEmitterAccessors();
            protoEI.hostActionAccessors[7] = bd[7].createHostActionAccessors();
        }
        if (length > 8) {
            this._binding8 = bd[8].binding;
            this._keyId8 = bd[8].getKeyId();
            this._visibility8 = bd[8].visibility;
            protoEI.eventEmitterAccessors[8] = bd[8].createEventEmitterAccessors();
            protoEI.hostActionAccessors[8] = bd[8].createHostActionAccessors();
        }
        if (length > 9) {
            this._binding9 = bd[9].binding;
            this._keyId9 = bd[9].getKeyId();
            this._visibility9 = bd[9].visibility;
            protoEI.eventEmitterAccessors[9] = bd[9].createEventEmitterAccessors();
            protoEI.hostActionAccessors[9] = bd[9].createHostActionAccessors();
        }
    }
    _ProtoElementInjectorInlineStrategy.prototype.hasBindings = function () { return lang_1.isPresent(this._binding0); };
    _ProtoElementInjectorInlineStrategy.prototype.getBindingAtIndex = function (index) {
        if (index == 0)
            return this._binding0;
        if (index == 1)
            return this._binding1;
        if (index == 2)
            return this._binding2;
        if (index == 3)
            return this._binding3;
        if (index == 4)
            return this._binding4;
        if (index == 5)
            return this._binding5;
        if (index == 6)
            return this._binding6;
        if (index == 7)
            return this._binding7;
        if (index == 8)
            return this._binding8;
        if (index == 9)
            return this._binding9;
        throw new OutOfBoundsAccess(index);
    };
    _ProtoElementInjectorInlineStrategy.prototype.createElementInjectorStrategy = function (ei) {
        return new ElementInjectorInlineStrategy(this, ei);
    };
    return _ProtoElementInjectorInlineStrategy;
})();
/**
 * Strategy used by the `ProtoElementInjector` when the number of bindings is more than 10.
 */
var _ProtoElementInjectorDynamicStrategy = (function () {
    function _ProtoElementInjectorDynamicStrategy(protoInj, bd) {
        var len = bd.length;
        this._bindings = collection_1.ListWrapper.createFixedSize(len);
        this._keyIds = collection_1.ListWrapper.createFixedSize(len);
        this._visibilities = collection_1.ListWrapper.createFixedSize(len);
        for (var i = 0; i < len; i++) {
            this._bindings[i] = bd[i].binding;
            this._keyIds[i] = bd[i].getKeyId();
            this._visibilities[i] = bd[i].visibility;
            protoInj.eventEmitterAccessors[i] = bd[i].createEventEmitterAccessors();
            protoInj.hostActionAccessors[i] = bd[i].createHostActionAccessors();
        }
    }
    _ProtoElementInjectorDynamicStrategy.prototype.hasBindings = function () { return lang_1.isPresent(this._bindings[0]); };
    _ProtoElementInjectorDynamicStrategy.prototype.getBindingAtIndex = function (index) {
        if (index < 0 || index >= this._bindings.length) {
            throw new OutOfBoundsAccess(index);
        }
        return this._bindings[index];
    };
    _ProtoElementInjectorDynamicStrategy.prototype.createElementInjectorStrategy = function (ei) {
        return new ElementInjectorDynamicStrategy(this, ei);
    };
    return _ProtoElementInjectorDynamicStrategy;
})();
var ElementInjector = (function (_super) {
    __extends(ElementInjector, _super);
    function ElementInjector(_proto, parent) {
        _super.call(this, parent);
        this._proto = _proto;
        this._lightDomAppInjector = null;
        this._shadowDomAppInjector = null;
        this._preBuiltObjects = null;
        this._constructionCounter = 0;
        this._strategy = _proto._strategy.createElementInjectorStrategy(this);
        this._constructionCounter = 0;
        this.hydrated = false;
        this._buildQueries();
        this._addParentQueries();
    }
    ElementInjector.prototype.dehydrate = function () {
        this.hydrated = false;
        this._host = null;
        this._preBuiltObjects = null;
        this._lightDomAppInjector = null;
        this._shadowDomAppInjector = null;
        this._strategy.callOnDestroy();
        this._strategy.clearInstances();
        this._constructionCounter = 0;
    };
    ElementInjector.prototype.onAllChangesDone = function () {
        if (lang_1.isPresent(this._query0) && this._query0.originator === this) {
            this._query0.list.fireCallbacks();
        }
        if (lang_1.isPresent(this._query1) && this._query1.originator === this) {
            this._query1.list.fireCallbacks();
        }
        if (lang_1.isPresent(this._query2) && this._query2.originator === this) {
            this._query2.list.fireCallbacks();
        }
    };
    ElementInjector.prototype.hydrate = function (injector, host, preBuiltObjects) {
        var p = this._proto;
        this._host = host;
        this._lightDomAppInjector = injector;
        this._preBuiltObjects = preBuiltObjects;
        if (p._firstBindingIsComponent) {
            this._shadowDomAppInjector =
                this._createShadowDomAppInjector(this._strategy.getComponentBinding(), injector);
        }
        this._checkShadowDomAppInjector(this._shadowDomAppInjector);
        this._strategy.hydrate();
        this._addVarBindingsToQueries();
        this.hydrated = true;
    };
    ElementInjector.prototype.hasVariableBinding = function (name) {
        var vb = this._proto.directiveVariableBindings;
        return lang_1.isPresent(vb) && vb.has(name);
    };
    ElementInjector.prototype.getVariableBinding = function (name) {
        var index = this._proto.directiveVariableBindings.get(name);
        return lang_1.isPresent(index) ? this.getDirectiveAtIndex(index) : this.getElementRef();
    };
    ElementInjector.prototype._createShadowDomAppInjector = function (componentDirective, appInjector) {
        if (!collection_1.ListWrapper.isEmpty(componentDirective.resolvedAppInjectables)) {
            return appInjector.createChildFromResolved(componentDirective.resolvedAppInjectables);
        }
        else {
            return appInjector;
        }
    };
    ElementInjector.prototype._checkShadowDomAppInjector = function (shadowDomAppInjector) {
        if (this._proto._firstBindingIsComponent && lang_1.isBlank(shadowDomAppInjector)) {
            throw new lang_1.BaseException('A shadowDomAppInjector is required as this ElementInjector contains a component');
        }
        else if (!this._proto._firstBindingIsComponent && lang_1.isPresent(shadowDomAppInjector)) {
            throw new lang_1.BaseException('No shadowDomAppInjector allowed as there is not component stored in this ElementInjector');
        }
    };
    ElementInjector.prototype.get = function (token) { return this._getByKey(di_1.Key.get(token), visibility_1.self, false, null); };
    ElementInjector.prototype.hasDirective = function (type) {
        return this._strategy.getObjByKeyId(di_1.Key.get(type).id, LIGHT_DOM_AND_SHADOW_DOM) !== _undefined;
    };
    ElementInjector.prototype.getEventEmitterAccessors = function () {
        return this._proto.eventEmitterAccessors;
    };
    ElementInjector.prototype.getHostActionAccessors = function () {
        return this._proto.hostActionAccessors;
    };
    ElementInjector.prototype.getDirectiveVariableBindings = function () {
        return this._proto.directiveVariableBindings;
    };
    ElementInjector.prototype.getComponent = function () { return this._strategy.getComponent(); };
    ElementInjector.prototype.getElementRef = function () { return this._preBuiltObjects.view.elementRefs[this._proto.index]; };
    ElementInjector.prototype.getViewContainerRef = function () {
        return new view_container_ref_1.ViewContainerRef(this._preBuiltObjects.viewManager, this.getElementRef());
    };
    ElementInjector.prototype.directParent = function () { return this._proto.distanceToParent < 2 ? this.parent : null; };
    ElementInjector.prototype._isComponentKey = function (key) { return this._strategy.isComponentKey(key); };
    ElementInjector.prototype._new = function (binding) {
        if (this._constructionCounter++ > this._strategy.getMaxDirectives()) {
            throw new di_1.CyclicDependencyError(binding.key);
        }
        var factory = binding.factory;
        var deps = binding.dependencies;
        var length = deps.length;
        var d0, d1, d2, d3, d4, d5, d6, d7, d8, d9;
        try {
            d0 = length > 0 ? this._getByDependency(deps[0], binding.key) : null;
            d1 = length > 1 ? this._getByDependency(deps[1], binding.key) : null;
            d2 = length > 2 ? this._getByDependency(deps[2], binding.key) : null;
            d3 = length > 3 ? this._getByDependency(deps[3], binding.key) : null;
            d4 = length > 4 ? this._getByDependency(deps[4], binding.key) : null;
            d5 = length > 5 ? this._getByDependency(deps[5], binding.key) : null;
            d6 = length > 6 ? this._getByDependency(deps[6], binding.key) : null;
            d7 = length > 7 ? this._getByDependency(deps[7], binding.key) : null;
            d8 = length > 8 ? this._getByDependency(deps[8], binding.key) : null;
            d9 = length > 9 ? this._getByDependency(deps[9], binding.key) : null;
        }
        catch (e) {
            if (e instanceof di_1.AbstractBindingError)
                e.addKey(binding.key);
            throw e;
        }
        var obj;
        switch (length) {
            case 0:
                obj = factory();
                break;
            case 1:
                obj = factory(d0);
                break;
            case 2:
                obj = factory(d0, d1);
                break;
            case 3:
                obj = factory(d0, d1, d2);
                break;
            case 4:
                obj = factory(d0, d1, d2, d3);
                break;
            case 5:
                obj = factory(d0, d1, d2, d3, d4);
                break;
            case 6:
                obj = factory(d0, d1, d2, d3, d4, d5);
                break;
            case 7:
                obj = factory(d0, d1, d2, d3, d4, d5, d6);
                break;
            case 8:
                obj = factory(d0, d1, d2, d3, d4, d5, d6, d7);
                break;
            case 9:
                obj = factory(d0, d1, d2, d3, d4, d5, d6, d7, d8);
                break;
            case 10:
                obj = factory(d0, d1, d2, d3, d4, d5, d6, d7, d8, d9);
                break;
        }
        this._addToQueries(obj, binding.key.token);
        return obj;
    };
    ElementInjector.prototype._getByDependency = function (dep, requestor) {
        if (!(dep instanceof DirectiveDependency)) {
            return this._getByKey(dep.key, dep.visibility, dep.optional, requestor);
        }
        var dirDep = dep;
        if (lang_1.isPresent(dirDep.attributeName))
            return this._buildAttribute(dirDep);
        if (lang_1.isPresent(dirDep.queryDecorator))
            return this._findQuery(dirDep.queryDecorator).list;
        if (dirDep.key.id === StaticKeys.instance().changeDetectorRefId) {
            var componentView = this._preBuiltObjects.view.componentChildViews[this._proto.index];
            return componentView.changeDetector.ref;
        }
        if (dirDep.key.id === StaticKeys.instance().elementRefId) {
            return this.getElementRef();
        }
        if (dirDep.key.id === StaticKeys.instance().viewContainerId) {
            return this.getViewContainerRef();
        }
        if (dirDep.key.id === StaticKeys.instance().protoViewId) {
            if (lang_1.isBlank(this._preBuiltObjects.protoView)) {
                if (dirDep.optional) {
                    return null;
                }
                throw new di_1.NoBindingError(dirDep.key);
            }
            return new view_ref_1.ProtoViewRef(this._preBuiltObjects.protoView);
        }
        return this._getByKey(dirDep.key, dirDep.visibility, dirDep.optional, requestor);
    };
    ElementInjector.prototype._buildAttribute = function (dep) {
        var attributes = this._proto.attributes;
        if (lang_1.isPresent(attributes) && attributes.has(dep.attributeName)) {
            return attributes.get(dep.attributeName);
        }
        else {
            return null;
        }
    };
    ElementInjector.prototype._buildQueriesForDeps = function (deps) {
        for (var i = 0; i < deps.length; i++) {
            var dep = deps[i];
            if (lang_1.isPresent(dep.queryDecorator)) {
                this._createQueryRef(dep.queryDecorator);
            }
        }
    };
    ElementInjector.prototype._addVarBindingsToQueries = function () {
        this._addVarBindingsToQuery(this._query0);
        this._addVarBindingsToQuery(this._query1);
        this._addVarBindingsToQuery(this._query2);
    };
    ElementInjector.prototype._addVarBindingsToQuery = function (queryRef) {
        if (lang_1.isBlank(queryRef) || !queryRef.query.isVarBindingQuery)
            return;
        var vb = queryRef.query.varBindings;
        for (var i = 0; i < vb.length; ++i) {
            if (this.hasVariableBinding(vb[i])) {
                queryRef.list.add(this.getVariableBinding(vb[i]));
            }
        }
    };
    ElementInjector.prototype._createQueryRef = function (query) {
        var queryList = new query_list_1.QueryList();
        if (lang_1.isBlank(this._query0)) {
            this._query0 = new QueryRef(query, queryList, this);
        }
        else if (lang_1.isBlank(this._query1)) {
            this._query1 = new QueryRef(query, queryList, this);
        }
        else if (lang_1.isBlank(this._query2)) {
            this._query2 = new QueryRef(query, queryList, this);
        }
        else
            throw new QueryError();
    };
    ElementInjector.prototype._addToQueries = function (obj, token) {
        if (lang_1.isPresent(this._query0) && (this._query0.query.selector === token)) {
            this._query0.list.add(obj);
        }
        if (lang_1.isPresent(this._query1) && (this._query1.query.selector === token)) {
            this._query1.list.add(obj);
        }
        if (lang_1.isPresent(this._query2) && (this._query2.query.selector === token)) {
            this._query2.list.add(obj);
        }
    };
    ElementInjector.prototype.addDirectivesMatchingQuery = function (query, list) {
        this._strategy.addDirectivesMatchingQuery(query, list);
    };
    ElementInjector.prototype._buildQueries = function () {
        if (lang_1.isPresent(this._proto)) {
            this._strategy.buildQueries();
        }
    };
    ElementInjector.prototype._findQuery = function (query) {
        if (lang_1.isPresent(this._query0) && this._query0.query === query) {
            return this._query0;
        }
        if (lang_1.isPresent(this._query1) && this._query1.query === query) {
            return this._query1;
        }
        if (lang_1.isPresent(this._query2) && this._query2.query === query) {
            return this._query2;
        }
        throw new lang_1.BaseException("Cannot find query for directive " + query + ".");
    };
    ElementInjector.prototype._hasQuery = function (query) {
        return this._query0 == query || this._query1 == query || this._query2 == query;
    };
    ElementInjector.prototype.link = function (parent) {
        parent.addChild(this);
        this._addParentQueries();
    };
    ElementInjector.prototype.linkAfter = function (parent, prevSibling) {
        parent.addChildAfter(this, prevSibling);
        this._addParentQueries();
    };
    ElementInjector.prototype._addParentQueries = function () {
        if (lang_1.isBlank(this.parent))
            return;
        if (lang_1.isPresent(this.parent._query0)) {
            this._addQueryToTree(this.parent._query0);
            if (this.hydrated)
                this.parent._query0.update();
        }
        if (lang_1.isPresent(this.parent._query1)) {
            this._addQueryToTree(this.parent._query1);
            if (this.hydrated)
                this.parent._query1.update();
        }
        if (lang_1.isPresent(this.parent._query2)) {
            this._addQueryToTree(this.parent._query2);
            if (this.hydrated)
                this.parent._query2.update();
        }
    };
    ElementInjector.prototype.unlink = function () {
        var queriesToUpdate = [];
        if (lang_1.isPresent(this.parent._query0)) {
            this._pruneQueryFromTree(this.parent._query0);
            queriesToUpdate.push(this.parent._query0);
        }
        if (lang_1.isPresent(this.parent._query1)) {
            this._pruneQueryFromTree(this.parent._query1);
            queriesToUpdate.push(this.parent._query1);
        }
        if (lang_1.isPresent(this.parent._query2)) {
            this._pruneQueryFromTree(this.parent._query2);
            queriesToUpdate.push(this.parent._query2);
        }
        this.remove();
        collection_1.ListWrapper.forEach(queriesToUpdate, function (q) { return q.update(); });
    };
    ElementInjector.prototype._pruneQueryFromTree = function (query) {
        this._removeQueryRef(query);
        var child = this._head;
        while (lang_1.isPresent(child)) {
            child._pruneQueryFromTree(query);
            child = child._next;
        }
    };
    ElementInjector.prototype._addQueryToTree = function (queryRef) {
        if (queryRef.query.descendants == false) {
            if (this == queryRef.originator) {
                this._addQueryToTreeSelfAndRecurse(queryRef);
            }
            else if (this.parent == queryRef.originator) {
                this._assignQueryRef(queryRef);
            }
        }
        else {
            this._addQueryToTreeSelfAndRecurse(queryRef);
        }
    };
    ElementInjector.prototype._addQueryToTreeSelfAndRecurse = function (queryRef) {
        this._assignQueryRef(queryRef);
        var child = this._head;
        while (lang_1.isPresent(child)) {
            child._addQueryToTree(queryRef);
            child = child._next;
        }
    };
    ElementInjector.prototype._assignQueryRef = function (query) {
        if (lang_1.isBlank(this._query0)) {
            this._query0 = query;
            return;
        }
        else if (lang_1.isBlank(this._query1)) {
            this._query1 = query;
            return;
        }
        else if (lang_1.isBlank(this._query2)) {
            this._query2 = query;
            return;
        }
        throw new QueryError();
    };
    ElementInjector.prototype._removeQueryRef = function (query) {
        if (this._query0 == query)
            this._query0 = null;
        if (this._query1 == query)
            this._query1 = null;
        if (this._query2 == query)
            this._query2 = null;
    };
    ElementInjector.prototype._getByKey = function (key, visibility, optional, requestor) {
        var ei = this;
        var currentVisibility = this._isComponentKey(requestor) ?
            LIGHT_DOM_AND_SHADOW_DOM :
            // and light dom dependencies
            LIGHT_DOM;
        var depth = visibility.depth;
        if (!visibility.includeSelf) {
            depth -= ei._proto.distanceToParent;
            if (lang_1.isPresent(ei._parent)) {
                ei = ei._parent;
            }
            else {
                ei = ei._host;
                currentVisibility = visibility.crossComponentBoundaries ? LIGHT_DOM : SHADOW_DOM;
            }
        }
        while (ei != null && depth >= 0) {
            var preBuiltObj = ei._getPreBuiltObjectByKeyId(key.id);
            if (preBuiltObj !== _undefined)
                return preBuiltObj;
            var dir = ei._getObjByKeyId(key.id, currentVisibility);
            if (dir !== _undefined)
                return dir;
            depth -= ei._proto.distanceToParent;
            // we check only one mode with the SHADOW_DOM visibility
            if (currentVisibility === SHADOW_DOM)
                break;
            if (lang_1.isPresent(ei._parent)) {
                ei = ei._parent;
            }
            else {
                ei = ei._host;
                currentVisibility = visibility.crossComponentBoundaries ? LIGHT_DOM : SHADOW_DOM;
            }
        }
        if (lang_1.isPresent(this._host) && this._host._isComponentKey(key)) {
            return this._host.getComponent();
        }
        else if (optional) {
            return this._appInjector(requestor).getOptional(key);
        }
        else {
            return this._appInjector(requestor).get(key);
        }
    };
    ElementInjector.prototype._appInjector = function (requestor) {
        if (lang_1.isPresent(requestor) && this._isComponentKey(requestor)) {
            return this._shadowDomAppInjector;
        }
        else {
            return this._lightDomAppInjector;
        }
    };
    ElementInjector.prototype._getPreBuiltObjectByKeyId = function (keyId) {
        var staticKeys = StaticKeys.instance();
        if (keyId === staticKeys.viewManagerId)
            return this._preBuiltObjects.viewManager;
        return _undefined;
    };
    ElementInjector.prototype._getObjByKeyId = function (keyId, visibility) {
        return this._strategy.getObjByKeyId(keyId, visibility);
    };
    ElementInjector.prototype.getDirectiveAtIndex = function (index) { return this._strategy.getDirectiveAtIndex(index); };
    ElementInjector.prototype.hasInstances = function () { return this._constructionCounter > 0; };
    ElementInjector.prototype.getLightDomAppInjector = function () { return this._lightDomAppInjector; };
    ElementInjector.prototype.getShadowDomAppInjector = function () { return this._shadowDomAppInjector; };
    ElementInjector.prototype.getHost = function () { return this._host; };
    ElementInjector.prototype.getBoundElementIndex = function () { return this._proto.index; };
    return ElementInjector;
})(TreeNode);
exports.ElementInjector = ElementInjector;
/**
 * Strategy used by the `ElementInjector` when the number of bindings is 10 or less.
 * In such a case, inlining fields is benefitial for performances.
 */
var ElementInjectorInlineStrategy = (function () {
    function ElementInjectorInlineStrategy(_protoStrategy, _ei) {
        this._protoStrategy = _protoStrategy;
        this._ei = _ei;
        // If this element injector has a component, the component instance will be stored in _obj0
        this._obj0 = null;
        this._obj1 = null;
        this._obj2 = null;
        this._obj3 = null;
        this._obj4 = null;
        this._obj5 = null;
        this._obj6 = null;
        this._obj7 = null;
        this._obj8 = null;
        this._obj9 = null;
    }
    ElementInjectorInlineStrategy.prototype.callOnDestroy = function () {
        var p = this._protoStrategy;
        if (p._binding0 instanceof DirectiveBinding && p._binding0.callOnDestroy) {
            this._obj0.onDestroy();
        }
        if (p._binding1 instanceof DirectiveBinding && p._binding1.callOnDestroy) {
            this._obj1.onDestroy();
        }
        if (p._binding2 instanceof DirectiveBinding && p._binding2.callOnDestroy) {
            this._obj2.onDestroy();
        }
        if (p._binding3 instanceof DirectiveBinding && p._binding3.callOnDestroy) {
            this._obj3.onDestroy();
        }
        if (p._binding4 instanceof DirectiveBinding && p._binding4.callOnDestroy) {
            this._obj4.onDestroy();
        }
        if (p._binding5 instanceof DirectiveBinding && p._binding5.callOnDestroy) {
            this._obj5.onDestroy();
        }
        if (p._binding6 instanceof DirectiveBinding && p._binding6.callOnDestroy) {
            this._obj6.onDestroy();
        }
        if (p._binding7 instanceof DirectiveBinding && p._binding7.callOnDestroy) {
            this._obj7.onDestroy();
        }
        if (p._binding8 instanceof DirectiveBinding && p._binding8.callOnDestroy) {
            this._obj8.onDestroy();
        }
        if (p._binding9 instanceof DirectiveBinding && p._binding9.callOnDestroy) {
            this._obj9.onDestroy();
        }
    };
    ElementInjectorInlineStrategy.prototype.clearInstances = function () {
        this._obj0 = null;
        this._obj1 = null;
        this._obj2 = null;
        this._obj3 = null;
        this._obj4 = null;
        this._obj5 = null;
        this._obj6 = null;
        this._obj7 = null;
        this._obj8 = null;
        this._obj9 = null;
    };
    ElementInjectorInlineStrategy.prototype.hydrate = function () {
        var p = this._protoStrategy;
        var e = this._ei;
        if (lang_1.isPresent(p._keyId0) && lang_1.isBlank(this._obj0))
            this._obj0 = e._new(p._binding0);
        if (lang_1.isPresent(p._keyId1) && lang_1.isBlank(this._obj1))
            this._obj1 = e._new(p._binding1);
        if (lang_1.isPresent(p._keyId2) && lang_1.isBlank(this._obj2))
            this._obj2 = e._new(p._binding2);
        if (lang_1.isPresent(p._keyId3) && lang_1.isBlank(this._obj3))
            this._obj3 = e._new(p._binding3);
        if (lang_1.isPresent(p._keyId4) && lang_1.isBlank(this._obj4))
            this._obj4 = e._new(p._binding4);
        if (lang_1.isPresent(p._keyId5) && lang_1.isBlank(this._obj5))
            this._obj5 = e._new(p._binding5);
        if (lang_1.isPresent(p._keyId6) && lang_1.isBlank(this._obj6))
            this._obj6 = e._new(p._binding6);
        if (lang_1.isPresent(p._keyId7) && lang_1.isBlank(this._obj7))
            this._obj7 = e._new(p._binding7);
        if (lang_1.isPresent(p._keyId8) && lang_1.isBlank(this._obj8))
            this._obj8 = e._new(p._binding8);
        if (lang_1.isPresent(p._keyId9) && lang_1.isBlank(this._obj9))
            this._obj9 = e._new(p._binding9);
    };
    ElementInjectorInlineStrategy.prototype.getComponent = function () { return this._obj0; };
    ElementInjectorInlineStrategy.prototype.isComponentKey = function (key) {
        return this._ei._proto._firstBindingIsComponent && lang_1.isPresent(key) &&
            key.id === this._protoStrategy._keyId0;
    };
    ElementInjectorInlineStrategy.prototype.buildQueries = function () {
        var p = this._protoStrategy;
        if (p._binding0 instanceof DirectiveBinding) {
            this._ei._buildQueriesForDeps(p._binding0.dependencies);
        }
        if (p._binding1 instanceof DirectiveBinding) {
            this._ei._buildQueriesForDeps(p._binding1.dependencies);
        }
        if (p._binding2 instanceof DirectiveBinding) {
            this._ei._buildQueriesForDeps(p._binding2.dependencies);
        }
        if (p._binding3 instanceof DirectiveBinding) {
            this._ei._buildQueriesForDeps(p._binding3.dependencies);
        }
        if (p._binding4 instanceof DirectiveBinding) {
            this._ei._buildQueriesForDeps(p._binding4.dependencies);
        }
        if (p._binding5 instanceof DirectiveBinding) {
            this._ei._buildQueriesForDeps(p._binding5.dependencies);
        }
        if (p._binding6 instanceof DirectiveBinding) {
            this._ei._buildQueriesForDeps(p._binding6.dependencies);
        }
        if (p._binding7 instanceof DirectiveBinding) {
            this._ei._buildQueriesForDeps(p._binding7.dependencies);
        }
        if (p._binding8 instanceof DirectiveBinding) {
            this._ei._buildQueriesForDeps(p._binding8.dependencies);
        }
        if (p._binding9 instanceof DirectiveBinding) {
            this._ei._buildQueriesForDeps(p._binding9.dependencies);
        }
    };
    ElementInjectorInlineStrategy.prototype.addDirectivesMatchingQuery = function (query, list) {
        var p = this._protoStrategy;
        if (lang_1.isPresent(p._binding0) && p._binding0.key.token === query.selector)
            list.push(this._obj0);
        if (lang_1.isPresent(p._binding1) && p._binding1.key.token === query.selector)
            list.push(this._obj1);
        if (lang_1.isPresent(p._binding2) && p._binding2.key.token === query.selector)
            list.push(this._obj2);
        if (lang_1.isPresent(p._binding3) && p._binding3.key.token === query.selector)
            list.push(this._obj3);
        if (lang_1.isPresent(p._binding4) && p._binding4.key.token === query.selector)
            list.push(this._obj4);
        if (lang_1.isPresent(p._binding5) && p._binding5.key.token === query.selector)
            list.push(this._obj5);
        if (lang_1.isPresent(p._binding6) && p._binding6.key.token === query.selector)
            list.push(this._obj6);
        if (lang_1.isPresent(p._binding7) && p._binding7.key.token === query.selector)
            list.push(this._obj7);
        if (lang_1.isPresent(p._binding8) && p._binding8.key.token === query.selector)
            list.push(this._obj8);
        if (lang_1.isPresent(p._binding9) && p._binding9.key.token === query.selector)
            list.push(this._obj9);
    };
    ElementInjectorInlineStrategy.prototype.getObjByKeyId = function (keyId, visibility) {
        var p = this._protoStrategy;
        if (p._keyId0 === keyId && (p._visibility0 & visibility) > 0) {
            if (lang_1.isBlank(this._obj0)) {
                this._obj0 = this._ei._new(p._binding0);
            }
            return this._obj0;
        }
        if (p._keyId1 === keyId && (p._visibility1 & visibility) > 0) {
            if (lang_1.isBlank(this._obj1)) {
                this._obj1 = this._ei._new(p._binding1);
            }
            return this._obj1;
        }
        if (p._keyId2 === keyId && (p._visibility2 & visibility) > 0) {
            if (lang_1.isBlank(this._obj2)) {
                this._obj2 = this._ei._new(p._binding2);
            }
            return this._obj2;
        }
        if (p._keyId3 === keyId && (p._visibility3 & visibility) > 0) {
            if (lang_1.isBlank(this._obj3)) {
                this._obj3 = this._ei._new(p._binding3);
            }
            return this._obj3;
        }
        if (p._keyId4 === keyId && (p._visibility4 & visibility) > 0) {
            if (lang_1.isBlank(this._obj4)) {
                this._obj4 = this._ei._new(p._binding4);
            }
            return this._obj4;
        }
        if (p._keyId5 === keyId && (p._visibility5 & visibility) > 0) {
            if (lang_1.isBlank(this._obj5)) {
                this._obj5 = this._ei._new(p._binding5);
            }
            return this._obj5;
        }
        if (p._keyId6 === keyId && (p._visibility6 & visibility) > 0) {
            if (lang_1.isBlank(this._obj6)) {
                this._obj6 = this._ei._new(p._binding6);
            }
            return this._obj6;
        }
        if (p._keyId7 === keyId && (p._visibility7 & visibility) > 0) {
            if (lang_1.isBlank(this._obj7)) {
                this._obj7 = this._ei._new(p._binding7);
            }
            return this._obj7;
        }
        if (p._keyId8 === keyId && (p._visibility8 & visibility) > 0) {
            if (lang_1.isBlank(this._obj8)) {
                this._obj8 = this._ei._new(p._binding8);
            }
            return this._obj8;
        }
        if (p._keyId9 === keyId && (p._visibility9 & visibility) > 0) {
            if (lang_1.isBlank(this._obj9)) {
                this._obj9 = this._ei._new(p._binding9);
            }
            return this._obj9;
        }
        return _undefined;
    };
    ElementInjectorInlineStrategy.prototype.getDirectiveAtIndex = function (index) {
        if (index == 0)
            return this._obj0;
        if (index == 1)
            return this._obj1;
        if (index == 2)
            return this._obj2;
        if (index == 3)
            return this._obj3;
        if (index == 4)
            return this._obj4;
        if (index == 5)
            return this._obj5;
        if (index == 6)
            return this._obj6;
        if (index == 7)
            return this._obj7;
        if (index == 8)
            return this._obj8;
        if (index == 9)
            return this._obj9;
        throw new OutOfBoundsAccess(index);
    };
    ElementInjectorInlineStrategy.prototype.getComponentBinding = function () {
        return this._protoStrategy._binding0;
    };
    ElementInjectorInlineStrategy.prototype.getMaxDirectives = function () { return _MAX_DIRECTIVE_CONSTRUCTION_COUNTER; };
    return ElementInjectorInlineStrategy;
})();
/**
 * Strategy used by the `ElementInjector` when the number of bindings is 10 or less.
 * In such a case, inlining fields is benefitial for performances.
 */
var ElementInjectorDynamicStrategy = (function () {
    function ElementInjectorDynamicStrategy(_protoStrategy, _ei) {
        this._protoStrategy = _protoStrategy;
        this._ei = _ei;
        this._objs = collection_1.ListWrapper.createFixedSize(_protoStrategy._bindings.length);
    }
    ElementInjectorDynamicStrategy.prototype.callOnDestroy = function () {
        var p = this._protoStrategy;
        for (var i = 0; i < p._bindings.length; i++) {
            if (p._bindings[i] instanceof DirectiveBinding &&
                p._bindings[i].callOnDestroy) {
                this._objs[i].onDestroy();
            }
        }
    };
    ElementInjectorDynamicStrategy.prototype.clearInstances = function () { collection_1.ListWrapper.fill(this._objs, null); };
    ElementInjectorDynamicStrategy.prototype.hydrate = function () {
        var p = this._protoStrategy;
        for (var i = 0; i < p._keyIds.length; i++) {
            if (lang_1.isPresent(p._keyIds[i]) && lang_1.isBlank(this._objs[i])) {
                this._objs[i] = this._ei._new(p._bindings[i]);
            }
        }
    };
    ElementInjectorDynamicStrategy.prototype.getComponent = function () { return this._objs[0]; };
    ElementInjectorDynamicStrategy.prototype.isComponentKey = function (key) {
        return this._ei._proto._firstBindingIsComponent && lang_1.isPresent(key) &&
            key.id === this._protoStrategy._keyIds[0];
    };
    ElementInjectorDynamicStrategy.prototype.buildQueries = function () {
        var p = this._protoStrategy;
        for (var i = 0; i < p._bindings.length; i++) {
            if (p._bindings[i] instanceof DirectiveBinding) {
                this._ei._buildQueriesForDeps(p._bindings[i].dependencies);
            }
        }
    };
    ElementInjectorDynamicStrategy.prototype.addDirectivesMatchingQuery = function (query, list) {
        var p = this._protoStrategy;
        for (var i = 0; i < p._bindings.length; i++) {
            if (p._bindings[i].key.token === query.selector)
                list.push(this._objs[i]);
        }
    };
    ElementInjectorDynamicStrategy.prototype.getObjByKeyId = function (keyId, visibility) {
        var p = this._protoStrategy;
        // TODO(vicb): optimize lookup ?
        for (var i = 0; i < p._keyIds.length; i++) {
            if (p._keyIds[i] === keyId && (p._visibilities[i] & visibility) > 0) {
                if (lang_1.isBlank(this._objs[i])) {
                    this._objs[i] = this._ei._new(p._bindings[i]);
                }
                return this._objs[i];
            }
        }
        return _undefined;
    };
    ElementInjectorDynamicStrategy.prototype.getDirectiveAtIndex = function (index) {
        if (index < 0 || index >= this._objs.length) {
            throw new OutOfBoundsAccess(index);
        }
        return this._objs[index];
    };
    ElementInjectorDynamicStrategy.prototype.getComponentBinding = function () {
        return this._protoStrategy._bindings[0];
    };
    ElementInjectorDynamicStrategy.prototype.getMaxDirectives = function () { return this._objs.length; };
    return ElementInjectorDynamicStrategy;
})();
var OutOfBoundsAccess = (function (_super) {
    __extends(OutOfBoundsAccess, _super);
    function OutOfBoundsAccess(index) {
        _super.call(this);
        this.message = "Index " + index + " is out-of-bounds.";
    }
    OutOfBoundsAccess.prototype.toString = function () { return this.message; };
    return OutOfBoundsAccess;
})(lang_1.BaseException);
var QueryError = (function (_super) {
    __extends(QueryError, _super);
    // TODO(rado): pass the names of the active directives.
    function QueryError() {
        _super.call(this);
        this.message = 'Only 3 queries can be concurrently active in a template.';
    }
    QueryError.prototype.toString = function () { return this.message; };
    return QueryError;
})(lang_1.BaseException);
var QueryRef = (function () {
    function QueryRef(query, list, originator) {
        this.query = query;
        this.list = list;
        this.originator = originator;
    }
    QueryRef.prototype.update = function () {
        var aggregator = [];
        this.visit(this.originator, aggregator);
        this.list.reset(aggregator);
    };
    QueryRef.prototype.visit = function (inj, aggregator) {
        if (lang_1.isBlank(inj) || !inj._hasQuery(this))
            return;
        if (this.query.isVarBindingQuery) {
            this._aggregateVariableBindings(inj, aggregator);
        }
        else {
            this._aggregateDirective(inj, aggregator);
        }
        var child = inj._head;
        while (lang_1.isPresent(child)) {
            this.visit(child, aggregator);
            child = child._next;
        }
    };
    QueryRef.prototype._aggregateVariableBindings = function (inj, aggregator) {
        var vb = this.query.varBindings;
        for (var i = 0; i < vb.length; ++i) {
            if (inj.hasVariableBinding(vb[i])) {
                aggregator.push(inj.getVariableBinding(vb[i]));
            }
        }
    };
    QueryRef.prototype._aggregateDirective = function (inj, aggregator) {
        inj.addDirectivesMatchingQuery(this.query, aggregator);
    };
    return QueryRef;
})();
