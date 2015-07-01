/// <reference path="../../../typings/jquery/jquery.d.ts"/>

import {Component, Directive, View} from 'angular2/angular2';
import core = require('angular2/core');
import helper = require('../../helper');

@Component({
  selector: 'data-view'
})

// skyblue: #8ab4e6
// green: #92d14f


@View({
  templateUrl:helper.getTemplateUrlByComponentName('data-view')
})

class DataView{

  constructor(viewContainer: core.ViewContainerRef) {
    //this.parent = helper.getParentFromViewContainer(viewContainer);
  }

}

export = DataView;
