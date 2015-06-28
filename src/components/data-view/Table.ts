
import {Component, Directive, View} from 'angular2/angular2';
import core = require('angular2/core');

@Component({
  selector: 'table'
})

class TableComponent{



  constructor(viewContainer: core.ViewContainerRef) {
    //this.parent = helper.getParentFromViewContainer(viewContainer);
  }

}

export = TableComponent;
