/// <reference path="../../../typings/jquery/jquery.d.ts"/>
/// <reference path="../../../typings/socket.io-client/socket.io-client.d.ts"/>
import {Component, Directive, View} from 'angular2/angular2';
import core = require('angular2/core');
import helper = require('../../helper');


var socket = io.connect(location.host);
socket.on('outlet.update', function (data) {
  console.log('outlet.update');
  console.log(data);
});

var selected:JQuery;


@Component({
  selector: 'data-view'
})

// skyblue: #8ab4e6
// green: #92d14f


@View({
  templateUrl:helper.getTemplateUrlByComponentName('data-view')
})

class DataView{
  ngElement;
  $elem:JQuery;

  titleArray:Array<any>;
  data:Array<Array<any>>;

  constructor(viewContainer: core.ViewContainerRef) {
    //this.parent = helper.getParentFromViewContainer(viewContainer);
    this.ngElement =viewContainer.element;
    var domElement:HTMLElement = (<any>this.ngElement).domElement;
    this.$elem = $(domElement);

    this.titleArray = ['name','color','scene','initShow'];

    this.data = [
      ['小明','red','scene_01','12'],
      ['小红','gray','scene_02','13']
    ]

    this.drawTable();
  }



  editable_cell(warp:string,val:any):JQuery{
    var cell = $(warp);
    cell.text(val);
    cell.click(()=>{
      if(selected){
        selected.css('background','');
      }
      cell.css('background','black');
      cell.focus()
      selected = cell;
    });
    cell.blur(()=>{
        cell.css('background','');
    });
    cell.attr('contenteditable','');
    return cell;
  }

  editable_th(i):JQuery{
    var th = this.editable_cell('<th>',this.titleArray[i]);
    return th;
  }

  editable_td(i,j):JQuery{
    var td = this.editable_cell('<td>',this.data[i][j]);
    td.keyup(()=>{
      console.log(td.text());
    })
    return td;
  }

  add_column(){
    this.titleArray.push('');
    for(var i=0;i<this.data.length;i++){
      this.data[i].push('');
    }
    this.redrawTable();
  }

  add_row(){
    var newRow = [];
    for(var i=0; i < this.titleArray.length;i++){
      newRow.push('');
    }
    this.data.push(newRow);
    this.redrawTable();
  }

  redrawTable(){
    var tableContent:JQuery = this.$elem.find('.content');
    tableContent.html('');
    this.drawTable();
  }

  drawTable(){
    var tableContent:JQuery = this.$elem.find('.content');
    var table = $('<table>');
    var title = $('<tr>');


    for(var i=0;i<this.titleArray.length;i++){
      var th = this.editable_th(i);
      title.append(th);
    }
    var addColumnBtn = $('<th class="add-col-btn"><img src="public/images/add-btn-icon.png" alt=""></th>');
    title.append(addColumnBtn);
    table.append(title);

    addColumnBtn.click(()=>{
      this.add_column();
    });


    for(var i=0;i<this.data.length;i++){
      var row = $('<tr>');
      for(var j=0;j<this.data[i].length;j++){
        var td = this.editable_td(i,j)
        row.append(td);
      }
      table.append(row);
    }
    var lastRow = $('<tr>');
    var addRowBtn = $('<td class="add-row-btn"><img src="public/images/add-btn-icon.png" alt=""></td>');
    lastRow.append(addRowBtn);
    table.append(lastRow);

    addRowBtn.click(()=>{
      this.add_row();
    })

    tableContent.append(table);

  }

}

export = DataView;
