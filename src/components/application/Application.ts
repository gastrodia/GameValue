/// <reference path="../../../typings/jquery/jquery.d.ts"/>

import angular = require('angular2/angular2');
import {ElementRef, Component, Directive, View, Injectable, Renderer} from 'angular2/angular2';
import Folder = require('../folder/Folder');
import DataView = require('../data-view/DataView');
import helper = require('../../helper');

@Component({
  selector: 'application'
})

@View({
  templateUrl: helper.getTemplateUrlByComponentName('application'),
  directives: [Folder,DataView]
})



class Application {

  public world:any = {};

  constructor(){
    $.get('/api/outlet',(outlet)=>{
      this.world.outlet = outlet;
    });
  }

}

export = Application;
