/// <reference path="./interfaces.d.ts"/>
import {bootstrap} from 'angular2/angular2';
import {bind} from 'angular2/di';


import Application = require('./components/application/Application');

export function main() {
  bootstrap(Application);
}

main();

import CVSImporter = require('./Importer/CVSImporter');
import ExeclImporter = require('./Importer/ExcelImporter');
var myImporter = new ExeclImporter(new CVSImporter());
myImporter.import();
