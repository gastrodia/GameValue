import angular = require('angular2/angular2');
import {ElementRef, Component, Directive, View, Injectable, Renderer} from 'angular2/angular2';


@Injectable()
class GreetingService {
  greeting: string = 'hello';
} 

@Directive({selector: '[red]'})
class RedDec {
  constructor(el: angular.ElementRef, renderer: angular.Renderer) {
    var $el = <any>el;
    var domElement:HTMLElement =   $el.domElement;
    domElement.style.background = 'red';
  }
}

@Component({
  selector: 'hello-app',
  appInjector: [GreetingService]
})

@View({

  template: `<div class="greeting">{{greeting}} <span red>world</span>!</div>
           <button class="changeButton" (click)="changeGreeting()">change greeting</button>`,
  directives: [RedDec]
})

export class HelloCmp {
  greeting: string;
  constructor(service: GreetingService) { this.greeting = service.greeting; }
  changeGreeting(): void { this.greeting = 'howdy'; }
}
