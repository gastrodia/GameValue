/**
 * @module
 * @public
 * @description
 * The `di` module provides dependency injection container services.
 */
var annotations_1 = require('./src/di/annotations');
exports.InjectAnnotation = annotations_1.InjectAnnotation;
exports.InjectPromiseAnnotation = annotations_1.InjectPromiseAnnotation;
exports.InjectLazyAnnotation = annotations_1.InjectLazyAnnotation;
exports.OptionalAnnotation = annotations_1.OptionalAnnotation;
exports.InjectableAnnotation = annotations_1.InjectableAnnotation;
exports.DependencyAnnotation = annotations_1.DependencyAnnotation;
var decorators_1 = require('./src/di/decorators');
exports.Inject = decorators_1.Inject;
exports.InjectPromise = decorators_1.InjectPromise;
exports.InjectLazy = decorators_1.InjectLazy;
exports.Optional = decorators_1.Optional;
exports.Injectable = decorators_1.Injectable;
var forward_ref_1 = require('./src/di/forward_ref');
exports.forwardRef = forward_ref_1.forwardRef;
exports.resolveForwardRef = forward_ref_1.resolveForwardRef;
var injector_1 = require('./src/di/injector');
exports.resolveBindings = injector_1.resolveBindings;
exports.Injector = injector_1.Injector;
var binding_1 = require('./src/di/binding');
exports.Binding = binding_1.Binding;
exports.BindingBuilder = binding_1.BindingBuilder;
exports.ResolvedBinding = binding_1.ResolvedBinding;
exports.Dependency = binding_1.Dependency;
exports.bind = binding_1.bind;
var key_1 = require('./src/di/key');
exports.Key = key_1.Key;
exports.KeyRegistry = key_1.KeyRegistry;
exports.TypeLiteral = key_1.TypeLiteral;
var exceptions_1 = require('./src/di/exceptions');
exports.NoBindingError = exceptions_1.NoBindingError;
exports.AbstractBindingError = exceptions_1.AbstractBindingError;
exports.AsyncBindingError = exceptions_1.AsyncBindingError;
exports.CyclicDependencyError = exceptions_1.CyclicDependencyError;
exports.InstantiationError = exceptions_1.InstantiationError;
exports.InvalidBindingError = exceptions_1.InvalidBindingError;
exports.NoAnnotationError = exceptions_1.NoAnnotationError;
var opaque_token_1 = require('./src/di/opaque_token');
exports.OpaqueToken = opaque_token_1.OpaqueToken;
