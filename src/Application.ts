import angular = require('angular2/angular2');
import {ElementRef, Component, Directive, View, Injectable, Renderer} from 'angular2/angular2';

import Table = require('./Table');

import keeper = require('./keeper');

@Component({
  selector: 'application'
})

@View({
  templateUrl: 'src/template/application.html',
  directives: [Table]
})



class Application {
  constructor(){
    keeper.set('app',this);
  }

  public v:string = 'v';
}

export = Application;
