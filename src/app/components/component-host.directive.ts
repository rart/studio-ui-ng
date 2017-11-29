import { Directive, Input, ViewContainerRef } from '@angular/core';

@Directive({
  selector: '[stdComponentHost], [std-component-host]'
}) export class ComponentHostDirective {

  @Input() stdComponentHost: any;
  @Input() data: any;

  get elem() {
    return this.viewContainerRef.element.nativeElement;
  }

  constructor(public viewContainerRef: ViewContainerRef) { }

}
