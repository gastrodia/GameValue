var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var property_binding_parser_1 = require('./property_binding_parser');
var text_interpolation_parser_1 = require('./text_interpolation_parser');
var directive_parser_1 = require('./directive_parser');
var view_splitter_1 = require('./view_splitter');
var shadow_dom_compile_step_1 = require('../shadow_dom/shadow_dom_compile_step');
var CompileStepFactory = (function () {
    function CompileStepFactory() {
    }
    CompileStepFactory.prototype.createSteps = function (template, subTaskPromises) {
        return null;
    };
    return CompileStepFactory;
})();
exports.CompileStepFactory = CompileStepFactory;
var DefaultStepFactory = (function (_super) {
    __extends(DefaultStepFactory, _super);
    function DefaultStepFactory(_parser, _shadowDomStrategy) {
        _super.call(this);
        this._parser = _parser;
        this._shadowDomStrategy = _shadowDomStrategy;
    }
    DefaultStepFactory.prototype.createSteps = function (template, subTaskPromises) {
        return [
            new view_splitter_1.ViewSplitter(this._parser),
            new property_binding_parser_1.PropertyBindingParser(this._parser),
            new directive_parser_1.DirectiveParser(this._parser, template.directives),
            new text_interpolation_parser_1.TextInterpolationParser(this._parser),
            new shadow_dom_compile_step_1.ShadowDomCompileStep(this._shadowDomStrategy, template, subTaskPromises)
        ];
    };
    return DefaultStepFactory;
})(CompileStepFactory);
exports.DefaultStepFactory = DefaultStepFactory;
