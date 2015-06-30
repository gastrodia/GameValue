/// <reference path="../../../typings/jquery/jquery.d.ts"/>

import {ElementRef, Component, Directive, View, Injectable,NgFor} from 'angular2/angular2';
import core = require('angular2/core');
import helper = require('../../helper');
import Application = require('../application/Application');
@Component({
  selector: 'outlet'
})

@View({
  templateUrl:helper.getTemplateUrlByComponentName('outlet'),
  directives:[NgFor]
})



class Outlet{


  ngElement:ElementRef;
  parent:Application;
  $elem:JQuery;
  outlet:any;

  constructor(viewContrainer:core.ViewContainerRef){
    this.ngElement =viewContrainer.element;
    var domElement:HTMLElement = (<any>this.ngElement).domElement;
    this.$elem = $(domElement);
    this.parent = helper.getParentFromViewContainer(viewContrainer);
    this.outlet = this.parent.world.outlet;

    this.redrawTree();
  }

  addItem(){
    console.log('add item');
  }

  getOutletObByAccessKey(accessKey){
    if(accessKey){
      var keys = accessKey.split('.');
      var ob = this.outlet;
      for(var i =0;i<keys.length;i++){
        ob = ob[keys[i]];
      }
      return ob;
    }else{
      return this.outlet;
    }
  }

  getOutletPObByAccessKey(accessKey){
    if(accessKey){
      var keys = accessKey.split('.');
      var ob = this.outlet;
      for(var i =1;i<keys.length;i++){
        ob = ob[keys[i-1]];
      }
      return ob;
    }else{
      return this.outlet;
    }
  }

  redrawTree(){
    console.log(this.outlet);
    var $target:JQuery = this.$elem.find('#outletList');
    $target.html('');
    this.drawTree($target,this.outlet);
  }

  drawTree($target,obj,dataAccessKey?:string){

    var $ul:JQuery = $('<ul>');
    var targetAddHeight = 0;
    for(var key in obj){
      ((key)=>{

        var newAccessKey = '';
        if(dataAccessKey){
          newAccessKey =  dataAccessKey + '.' + key;
        }else{
          newAccessKey = key;
        }

        var $addBtn:JQuery = $('<span class="add-item-btn">+</span>');
        var $deleteBtn:JQuery = $('<span class="delete-self-btn">X</span>');
        var $li:JQuery = $(`<li>${key}</li>`);



        $addBtn.click((e:Event)=>{
          console.log(key,'addBtn click');
          var $tmpLi = $('<li>');

          var $input = $('<input type="text">');
          $input.css({
            height:16,
            width:100,
            marginLeft:10
          });

          $tmpLi.append($input);


          $tmpLi.insertAfter($li);


          $input.keyup((e)=>{
            if(e.keyCode == 13){//enter
                var inputVal = $input.val();
                if(inputVal.indexOf('.') == -1){
                  $input.remove();
                  $tmpLi.remove();
                  var ob = this.getOutletObByAccessKey(newAccessKey);
                  ob[inputVal] = {};
                  this.redrawTree();
                }else{
                  alert('不可以包含字符"."');
                }

            }
          })
          e.stopPropagation();
        });
        $deleteBtn.click((e:Event)=>{
          if(!dataAccessKey && key == "world"){
            alert('无法删除根节点');
          }else{
            var pob = this.getOutletPObByAccessKey(newAccessKey);
            delete pob[key];
            e.stopPropagation();
            this.redrawTree();
          }

        });
        $li.append($addBtn);
        $li.append($deleteBtn);
        $ul.append($li);
        $li.click(function(){
          console.log(key,'li click');
        })

        if(Object.keys(obj[key]).length > 0){
          this.drawTree($li,obj[key],newAccessKey);
        }
      })(key);
    }
    console.log(targetAddHeight);

    $target.append($ul);
  }


}

export = Outlet;
