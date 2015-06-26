
import {Component, Directive, View} from 'angular2/angular2';
import core = require('angular2/core');

import Application = require('./Application');
import helper = require('./helper');

@Component({
  selector: 'table'
})

class TableComponent{ 

  parent:Application;

  constructor(viewContainer: core.ViewContainerRef) {
    this.parent = helper.getParentFromViewContainer(viewContainer);
  }

}

export = TableComponent;
