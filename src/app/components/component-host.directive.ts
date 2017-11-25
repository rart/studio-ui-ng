import { Directive, Input, ViewContainerRef } from '@angular/core';

@Directive({
  selector: '[stdComponentHost], [std-component-host]'
}) export class ComponentHostDirective {

  @Input() data: any;

  constructor(public viewContainerRef: ViewContainerRef) { }

}
