import {Component, Input, OnInit} from '@angular/core';

@Component({
  selector: 'std-view-title-bar',
  template: `
    <div class="title-bar">
      <div class="wrapper {{max ? 'set-max ' + max : ''}}">
        <h1 class="view-title"><i *ngIf="icon" [class]="icon"></i> <span>{{title}}</span></h1>
        <div class="actions">
          <ng-content></ng-content>
        </div>
      </div>
    </div>`,
  styleUrls: ['./view-title-bar.component.scss']
})
export class ViewTitleBarComponent implements OnInit {

  @Input() title;
  @Input() icon;
  @Input() max;

  constructor() { }

  ngOnInit() {
  }

}
