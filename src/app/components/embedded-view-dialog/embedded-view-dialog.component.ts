import {Component, Inject, OnInit, ComponentFactoryResolver, ViewChild, EventEmitter} from '@angular/core';
import {MatDialogRef, MAT_DIALOG_DATA} from '@angular/material';
import {ComponentHostDirective} from '../component-host.directive';

@Component({
  selector: 'std-embedded-view-dialog',
  templateUrl: './embedded-view-dialog.component.html',
  styleUrls: ['./embedded-view-dialog.component.scss']
})
export class EmbeddedViewDialogComponent implements OnInit {

  @ViewChild(ComponentHostDirective) cmpHost: ComponentHostDirective;

  constructor(public dialogRef: MatDialogRef<any>,
              private componentFactoryResolver: ComponentFactoryResolver,
              @Inject(MAT_DIALOG_DATA) public data: any) { }

  ngOnInit() {
    this.loadComponent();
  }

  done() {
    this.dialogRef.close();
  }

  loadComponent() {

    let componentFactory = this.componentFactoryResolver.resolveComponentFactory(this.data.component);

    let viewContainerRef = this.cmpHost.viewContainerRef;
    viewContainerRef.clear();

    let componentRef = viewContainerRef.createComponent(componentFactory);
    if (
      ((<any>componentRef.instance).finished) &&
      ((<any>componentRef.instance).finished) instanceof EventEmitter
    ) {
      (<EventEmitter<any>>(<any>componentRef.instance).finished).subscribe(() => {
        this.done();
      });
    }

  }

}
