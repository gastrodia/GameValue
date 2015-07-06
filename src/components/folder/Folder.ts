/// <reference path="../../../typings/jquery/jquery.d.ts"/>
/// <reference path="../../../typings/socket.io-client/socket.io-client.d.ts"/>
import {ElementRef, Component, Directive, View, Injectable,NgFor,onChange} from 'angular2/angular2';
import core = require('angular2/core');
import helper = require('../../helper');
import Application = require('../application/Application');

var socket = io.connect(location.host);

@Component({
  selector: 'folder'
})

@View({
  templateUrl:helper.getTemplateUrlByComponentName('folder'),
  directives:[NgFor]
})



class Folder{

  ngElement:ElementRef;
  parent:Application;
  $elem:JQuery;
  outlet:any;

  selectedLi:any;

  constructor(viewContrainer:core.ViewContainerRef){
    this.ngElement =viewContrainer.element;
    var domElement:HTMLElement = (<any>this.ngElement).domElement;
    this.$elem = $(domElement);
    this.parent = helper.getParentFromViewContainer(viewContrainer);
    this.outlet = this.parent.world.outlet;


    $.get('/api/outlet',(outlet)=>{
      this.outlet = outlet;
      this.redrawTree();
    });

    var input_dom_element = document.querySelector('#theFile');
    input_dom_element.addEventListener('change', handleFile, false);

    var save_file_btn = document.querySelector("#savefile");
    save_file_btn.addEventListener('click',handleSave,false);
  }

  //打开文件对话框
  upfile(){
    var elem = document.querySelector('#theFile');
    if(elem && document.createEvent) {
      var evt = document.createEvent("MouseEvents");
      evt.initEvent("click", true, false);
      elem.dispatchEvent(evt);
    }
  }

  addItem(){
    console.log('add item');
  }

  handleChange(outlet){
    console.log('change',outlet);
  }

  update(){
    socket.emit('outlet.update', this.outlet);
    this.redrawTree();
  }

  redrawTree(){
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

        var $addBtn:JQuery = $('<span class="add-item-btn"><img src="public/images/add-btn-icon.png" alt=""></span>');
        var $uploadBtn:JQuery = $('<span class="upload-table-btn"><img src="public/images/upload_icon.png" alt=""></span>');
        var $li:JQuery = $(`<li accessKey=${newAccessKey}>${key}</li>`);


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
                  var ob = helper.getOutletObByAccessKey(this.outlet,newAccessKey);
                  ob[inputVal] = {};
                  this.update();
                }else{
                  alert('不可以包含字符"."');
                }

            }
          })
          e.stopPropagation();
        });
        $uploadBtn.click((e:Event)=>{
          // if(!dataAccessKey && key == "world"){
          //   alert('无法删除根节点');
          // }else{
          //   var pob = helper.getOutletPObByAccessKey(this.outlet,newAccessKey);
          //   delete pob[key];
          //   e.stopPropagation();
          //   this.update();
          // }
          console.log('upload')
        });
        $li.append($addBtn);
        $li.append($uploadBtn);
        $ul.append($li);


        $li.click((e:Event) =>{
          if(this.selectedLi){
            this.selectedLi.css('background','');
          }
          $li.css('background','#16181B');
          this.selectedLi = $li;
          socket.emit('outlet.select',{
            accessKey:$li.attr('accessKey')
          })
          e.stopPropagation();
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

export = Folder;
