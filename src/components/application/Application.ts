import angular = require('angular2/angular2');
import {ElementRef, Component, Directive, View, Injectable, Renderer} from 'angular2/angular2';
import Outlet = require('../outlet/Outlet');
import helper = require('../../helper');

@Component({
  selector: 'application'
})

@View({
  templateUrl: helper.getTemplateUrlByComponentName('application'),
  directives: [Outlet]
})



class Application {

  public world:any = {};

  constructor(){


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
