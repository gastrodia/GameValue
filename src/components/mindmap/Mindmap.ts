import {ElementRef, Component, Directive, View, Injectable, Renderer} from 'angular2/angular2';
import core = require('angular2/core');

@Component({
  selector: 'mind-map'
})

class MindMap{

  constructor(viewContrainer:core.ViewContainerRef){
    //this.parent = helper.getParentFromViewContainer(viewContrainer);
  }
}

export = MindMap;
