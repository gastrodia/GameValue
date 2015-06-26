import angular = require('angular2/angular2');
import {ElementRef, Component, Directive, View, Injectable, Renderer} from 'angular2/angular2';

import Table = require('./Table');

import keeper = require('./keeper');

@Component({
  selector: 'application'
})

@View({
  template:  `
    <!-- The router-outlet displays the template for the current component based on the URL -->
    <router-outlet></router-outlet>
    <table></table>
  `,
  directives: [Table]
})



class Application {
  constructor(){
    keeper.set('app',this);
  }

  public v:string = 'v';
}

export = Application;
