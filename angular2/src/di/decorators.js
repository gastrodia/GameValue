var annotations_1 = require('./annotations');
var decorators_1 = require('../util/decorators');
exports.Inject = decorators_1.makeParamDecorator(annotations_1.InjectAnnotation);
exports.InjectPromise = decorators_1.makeParamDecorator(annotations_1.InjectPromiseAnnotation);
exports.InjectLazy = decorators_1.makeParamDecorator(annotations_1.InjectLazyAnnotation);
exports.Optional = decorators_1.makeParamDecorator(annotations_1.OptionalAnnotation);
exports.Injectable = decorators_1.makeDecorator(annotations_1.InjectableAnnotation);
