import {Directive, ViewContainerRef} from '@angular/core';

@Directive({
  selector: '[stdComponentHost], [std-component-host]'
}) export class ComponentHostDirective {

  constructor(public viewContainerRef: ViewContainerRef) { }

}

// import { Component, Input, OnInit, AfterViewInit, ViewChild, ComponentFactoryResolver, OnDestroy } from '@angular/core';
// import { DynamicComponentHostDirective } from './DynamicComponentHost.Directive;
// import { YourInputDataModel } from './Data.Model';
// import { DynamicComponentService } from "./DynamicComponent.Service";
// @Component({
//   selector: 'container-component,
//   templateUrl: 'app/tile/ContainerComponent.Template.html'
// })
// export class ContainerComponent implements OnInit {
//   @Input() tile: any;
//   @ViewChild(DynamicComponentHostDirective ) componentHost: DynamicComponentHostDirective ;
//   constructor(private _componentFactoryResolver: ComponentFactoryResolver,private dynamicComponentService :DynamicComponentService ) {
//   }
//   ngOnInit() {
//
//   }
//   ngAfterViewInit() {
//     this.renderComponents();
//   }
//   renderComponents() {
//     let component=this.dynamicComponentService .getComponent(this.tile.componentName);
//     let componentFactory = this._componentFactoryResolver.resolveComponentFactory(component);
//     let viewContainerRef = this.componentHost.viewContainerRef;
//     let componentRef = viewContainerRef.createComponent(componentFactory);
//     (componentRef.instance).data = this.tile;
//   }
// }

// export interface YourInputDataModel {
//   data: any;
// }

// //register your component
// @Injectable()
// export class DynamicComponentService {
//   getComponent(componentName:string) {
//     if(componentName==="YourDynamicComponent"){
//       return YourDynamicComponent;
//     } else if(componentName==="OtherComponent"){
//       return OtherComponent;
//     }
//   }
// }

// // YourDynamicComponent(Component we registered inside the factory loads dynamically )
// import { Component, OnInit, Input, ReflectiveInjector, Injector } from '@angular/core';
// @Component({
//   selector: 'mydynamiccomponent',
//   templateUrl: 'app/templates/YourDynamicComponent.html'
// })
// export class YourDynamicComponent implements OnInit {
//   @Input() data: any;
//   constructor() {
//   }
//   ngOnInit() {
//
//   }
// }

// @NgModule({
//   imports: [BrowserModule, HttpModule],
//   providers: [DynamicComponentService],
//   declarations: [
//     YourDynamicComponent,
//     OtherComponent
//   ],
//   exports: [],
//   entryComponents: [YourDynamicComponent,OtherComponent],
//   bootstrap: [MainApplicationComponent]
// }) export class AppModule {
//   constructor() {}
// }
