
import core = require('angular2/core');


//因为issue1831 parent无法直接注入到子类，但可以通过辅助方法由viewContrainer取出
//https://github.com/angular/angular/issues/1831
export function getParentFromViewContainer(viewContainer:core.ViewContainerRef):any{
  return viewContainer.element.parentView._view.context;
}
 
