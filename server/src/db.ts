/// <reference path="../typings/node/node.d.ts"/>
var Datastore = require('nedb');

export var outlet = new Datastore({filename:'./data/outlet.db',autoload:true});

export var data = new Datastore({filename:'./data/data.db',autoload:true});
