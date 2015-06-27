import {ElementRef, Component, Directive, View, Injectable,NgFor} from 'angular2/angular2';
import core = require('angular2/core');
import helper = require('./helper');
import Application = require('./Application');
@Component({
  selector: 'outlet'
})

@View({
  templateUrl:'src/template/outlet.html',
  directives:[NgFor]
})

class Outlet{


  ngElement:ElementRef;
  parent:Application;

  outlet:any;

  constructor(viewContrainer:core.ViewContainerRef){
    this.ngElement =viewContrainer.element;
    this.parent = helper.getParentFromViewContainer(viewContrainer);
    this.outlet = this.parent.world.outlet;
    console.log(this.outlet);

  }

  jsonToList(json):Array<any>{
    var list = [];
    for(var i in json){
      list.push({
        key:i,
        value:json[i]
      })
    }
    return list;
  }

  insertOutLetList(target:string){
    var domElement:HTMLElement = (<any>this.ngElement).domElement;
    var targetElement:HTMLElement = <any>domElement.querySelector(target);

    var str = '  <ul>';
    for(var key in this.outlet){
      str += `<li>${key}</li>`
    }
    str += '</ul>'
    targetElement.innerHTML = str;
  }
}

export = Outlet;
