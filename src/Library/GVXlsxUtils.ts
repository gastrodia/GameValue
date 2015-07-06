/// <reference path="../../typings/xlsx/xlsx.d.ts"/>



var System26 = require('./System26');




function WorkBookFromFile(file,callback:(sheet:xlsx.IWorkBook)=>void){
  var reader = new FileReader();
  reader.onload = function(e:any) {
    var _data = e.target.result;
    var workbook = XLSX.read(_data, {type: 'binary'});
    callback(workbook);
  };
  reader.readAsBinaryString(file);
}


function ArrayOfArraysFromWorkSheet(sheet:xlsx.IWorkSheet):Array<Array<any>>{
  var data = [];
  var buf_array = [];
  var buf_count = 0;
  for (var z in sheet) {
      /* all keys that do not begin with "!" correspond to cell addresses */
      if(z[0] === '!') continue;
      var value = JSON.stringify(sheet[z].v);
      var regList = z.match(/([A-Z]*)(\d*)/);
      var x = System26.fromNumber(regList[1]) - 1;
      var y = regList[2]*1 - 1;
      if(data[y]){
        data[y][x] = value;
      }else{
        data[y] = [];
        data[y][x] = value;
      }
  }
  console.log(data);
  return data;
}


function WorkSheetFromArrayOfArrays(data:Array<Array<any>>):xlsx.IWorkSheet {


  function arrayLength(array){
    if(array){
      return array.length;
    }else{
      return 0;
    }
  }


  function datenum(v, date1904?:any) {
  	if(date1904) v+=1462;
  	var epoch = Date.parse(v);
  	return (epoch - <any>new Date(Date.UTC(1899, 11, 30))) / (24 * 60 * 60 * 1000);
  }

  var ws = {};
  var range = {s: {c:10000000, r:10000000}, e: {c:0, r:0 }};
  for(var R = 0; R != arrayLength(data); ++R) {
    for(var C = 0; C != arrayLength(data[R]); ++C) {
      if(range.s.r > R) range.s.r = R;
      if(range.s.c > C) range.s.c = C;
      if(range.e.r < R) range.e.r = R;
      if(range.e.c < C) range.e.c = C;
      var cell:any = {v: data[R][C] };
      if(cell.v == null) continue;
      var cell_ref = XLSX.utils.encode_cell({c:C,r:R});

      if(typeof cell.v === 'number') cell.t = 'n';
      else if(typeof cell.v === 'boolean') cell.t = 'b';
      else if(cell.v instanceof Date) {
        cell.t = 'n'; cell.z = XLSX.SSF._table[14];
        cell.v = datenum(cell.v);
      }
      else cell.t = 's';

      ws[cell_ref] = cell;
    }
  }
  if(range.s.c < 10000000) ws['!ref'] = XLSX.utils.encode_range(range);
  return <any>ws;
}



function FileFromWorkBook(wb:xlsx.IWorkBook):Blob{
  function s2ab(s) {
    var buf = new ArrayBuffer(s.length);
    var view = new Uint8Array(buf);
    for (var i=0; i!=s.length; ++i) view[i] = s.charCodeAt(i) & 0xFF;
    return buf;
  }
  var wbout = XLSX.write(wb, {bookType:'xlsx', bookSST:true, type: 'binary'});
  return new Blob([s2ab(wbout)],{type:"application/octet-stream"});
}


class Workbook implements xlsx.IWorkBook{
  SheetNames;
  Sheets;
  Props;
  constructor(){
    if(!(this instanceof Workbook)) return new Workbook();
    this.SheetNames = [];
    this.Sheets = {};
  }
}



var data = null;
var dataName = null;

function readFile(file,callback:(data:Array<Array<any>>)=>void){

  WorkBookFromFile(file,function(workbook:xlsx.IWorkBook){
    var first_sheet_name = workbook.SheetNames[0];
    var worksheet = workbook.Sheets[first_sheet_name];
    var data = ArrayOfArraysFromWorkSheet(worksheet);
    callback(data);
  });
}

function writeFile(dataName,data){
  var worksheet = WorkSheetFromArrayOfArrays(data);
  var workbook = new Workbook();
  workbook.SheetNames.push(dataName);
  workbook.Sheets[dataName] = worksheet;
  var file = FileFromWorkBook(workbook);
  saveAs(file, dataName + ".xlsx")
}

function handleFile(e) {
  var file = e.target.files[0];
  dataName = file.name;//简单起见，直接将fileName作为sheetName
  readFile(file,function(_data){
    data = _data;
  })
}

function handleSave(e){
  writeFile(dataName,data);
}
