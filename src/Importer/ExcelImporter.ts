/// <reference path="../interfaces.d.ts"/>

class ExcelImporter implements Importer{

  importer:Importer;

  constructor(importer:Importer){
    this.importer = importer;
  }
  import(){
    this.importer.import();
    console.log('excel importer');
  };
}

export = ExcelImporter;
