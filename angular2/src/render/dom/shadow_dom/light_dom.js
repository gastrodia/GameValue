var dom_adapter_1 = require('angular2/src/dom/dom_adapter');
var collection_1 = require('angular2/src/facade/collection');
var lang_1 = require('angular2/src/facade/lang');
var DestinationLightDom = (function () {
    function DestinationLightDom() {
    }
    return DestinationLightDom;
})();
exports.DestinationLightDom = DestinationLightDom;
var _Root = (function () {
    function _Root(node, boundElement) {
        this.node = node;
        this.boundElement = boundElement;
    }
    return _Root;
})();
// TODO: LightDom should implement DestinationLightDom
// once interfaces are supported
var LightDom = (function () {
    function LightDom(lightDomView, element) {
        // The shadow DOM
        this.shadowDomView = null;
        this._roots = null;
        this.lightDomView = lightDomView;
        this.nodes = dom_adapter_1.DOM.childNodesAsList(element);
    }
    LightDom.prototype.attachShadowDomView = function (shadowDomView) { this.shadowDomView = shadowDomView; };
    LightDom.prototype.detachShadowDomView = function () { this.shadowDomView = null; };
    LightDom.prototype.redistribute = function () { redistributeNodes(this.contentTags(), this.expandedDomNodes()); };
    LightDom.prototype.contentTags = function () {
        if (lang_1.isPresent(this.shadowDomView)) {
            return this._collectAllContentTags(this.shadowDomView, []);
        }
        else {
            return [];
        }
    };
    // Collects the Content directives from the view and all its child views
    LightDom.prototype._collectAllContentTags = function (view, acc) {
        var _this = this;
        // Note: exiting early here is important as we call this function for every view
        // that is added, so we have O(n^2) runtime.
        // TODO(tbosch): fix the root problem, see
        // https://github.com/angular/angular/issues/2298
        if (view.proto.transitiveContentTagCount === 0) {
            return acc;
        }
        var els = view.boundElements;
        for (var i = 0; i < els.length; i++) {
            var el = els[i];
            if (lang_1.isPresent(el.contentTag)) {
                acc.push(el.contentTag);
            }
            if (lang_1.isPresent(el.viewContainer)) {
                collection_1.ListWrapper.forEach(el.viewContainer.contentTagContainers(), function (view) { _this._collectAllContentTags(view, acc); });
            }
        }
        return acc;
    };
    // Collects the nodes of the light DOM by merging:
    // - nodes from enclosed ViewContainers,
    // - nodes from enclosed content tags,
    // - plain DOM nodes
    LightDom.prototype.expandedDomNodes = function () {
        var res = [];
        var roots = this._findRoots();
        for (var i = 0; i < roots.length; ++i) {
            var root = roots[i];
            if (lang_1.isPresent(root.boundElement)) {
                var vc = root.boundElement.viewContainer;
                var content = root.boundElement.contentTag;
                if (lang_1.isPresent(vc)) {
                    res = collection_1.ListWrapper.concat(res, vc.nodes());
                }
                else if (lang_1.isPresent(content)) {
                    res = collection_1.ListWrapper.concat(res, content.nodes());
                }
                else {
                    res.push(root.node);
                }
            }
            else {
                res.push(root.node);
            }
        }
        return res;
    };
    // Returns a list of Roots for all the nodes of the light DOM.
    // The Root object contains the DOM node and its corresponding boundElement
    LightDom.prototype._findRoots = function () {
        if (lang_1.isPresent(this._roots))
            return this._roots;
        var boundElements = this.lightDomView.boundElements;
        this._roots = collection_1.ListWrapper.map(this.nodes, function (n) {
            var boundElement = null;
            for (var i = 0; i < boundElements.length; i++) {
                var boundEl = boundElements[i];
                if (lang_1.isPresent(boundEl) && boundEl.element === n) {
                    boundElement = boundEl;
                    break;
                }
            }
            return new _Root(n, boundElement);
        });
        return this._roots;
    };
    return LightDom;
})();
exports.LightDom = LightDom;
// Projects the light DOM into the shadow DOM
function redistributeNodes(contents, nodes) {
    for (var i = 0; i < contents.length; ++i) {
        var content = contents[i];
        var select = content.select;
        // Empty selector is identical to <content/>
        if (select.length === 0) {
            content.insert(collection_1.ListWrapper.clone(nodes));
            collection_1.ListWrapper.clear(nodes);
        }
        else {
            var matchSelector = function (n) { return dom_adapter_1.DOM.elementMatches(n, select); };
            var matchingNodes = collection_1.ListWrapper.filter(nodes, matchSelector);
            content.insert(matchingNodes);
            collection_1.ListWrapper.removeAll(nodes, matchingNodes);
        }
    }
    for (var i = 0; i < nodes.length; i++) {
        var node = nodes[i];
        if (lang_1.isPresent(node.parentNode)) {
            dom_adapter_1.DOM.remove(nodes[i]);
        }
    }
}
