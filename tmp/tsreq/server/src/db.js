/// <reference path="../typings/node/node.d.ts"/>
var Datastore = require('nedb');
exports.outlet = new Datastore({ filename: './data/outlet.db', autoload: true });
exports.data = new Datastore({ filename: './data/data.db', autoload: true });
