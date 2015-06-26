import {ElementRef, Component, Directive, View, Injectable, Renderer} from 'angular2/angular2';
import core = require('angular2/core');
import helper = require('./helper');
import Application = require('./Application');
@Component({
  selector: 'mind-map'
})

class MindMap{
  parent:Application;
  constructor(viewContrainer:core.ViewContainerRef){
    this.parent = helper.getParentFromViewContainer(viewContrainer);
  }
}

export = MindMap;
 
