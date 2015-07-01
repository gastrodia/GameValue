/// <reference path="../typings/node/node.d.ts"/>
var Datastore = require('nedb');
exports.user = new Datastore({ filename: './data/user.db', autoload: true });
exports.face = new Datastore({ filename: './data/face.db', autoload: true });
