
import core = require('angular2/core');


//因为issue1831 parent无法直接注入到子类，但可以通过辅助方法由viewContrainer取出
//https://github.com/angular/angular/issues/1831
export function getParentFromViewContainer(viewContainer:core.ViewContainerRef):any{
  return viewContainer.element.parentView._view.context;
}

export function getTemplateUrlByComponentName(componentName){
  return 'src/components/' + componentName + '/' + componentName  + '.html';
}

export function  getOutletObByAccessKey(outlet,accessKey){
    if(accessKey){
      var keys = accessKey.split('.');
      var ob = outlet;
      for(var i =0;i<keys.length;i++){
        ob = ob[keys[i]];
      }
      return ob;
    }else{
      return outlet;
    }
  }


export function getOutletPObByAccessKey(outlet,accessKey){
  if(accessKey){
    var keys = accessKey.split('.');
    var ob = outlet;
    for(var i =1;i<keys.length;i++){
      ob = ob[keys[i-1]];
    }
    return ob;
  }else{
    return outlet;
  }
}
