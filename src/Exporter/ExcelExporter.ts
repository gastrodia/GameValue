/// <reference path="../interfaces.d.ts"/>

class ExcelExporter implements Exporter{
  export(){
    console.log('excel export');
  }
}

export = ExcelExporter;
