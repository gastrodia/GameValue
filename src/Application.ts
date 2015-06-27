import angular = require('angular2/angular2');
import {ElementRef, Component, Directive, View, Injectable, Renderer} from 'angular2/angular2';

import Table = require('./Table');
import Outlet = require('./Outlet');
import keeper = require('./keeper');

@Component({
  selector: 'application'
})

@View({
  templateUrl: 'src/template/application.html',
  directives: [Table,Outlet]
})



class Application {

  public world:any = {};

  constructor(){
    keeper.set('app',this);

    this.world = {
        outlet:{
          npc:{
            id:{},
            name:{},
            color:{}
          },
          buff:{
            key:{},
            effect:{}
          }
        },

    }
  }

}

export = Application;
