/// <reference path="./interfaces.d.ts"/>
import {bootstrap} from 'angular2/angular2';
import {bind} from 'angular2/di';


import Application = require('./components/application/Application');

export function main() {
  bootstrap(Application);
}

main();
