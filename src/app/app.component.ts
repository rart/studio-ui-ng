import { Component, HostBinding, ViewEncapsulation } from '@angular/core';

@Component({
  selector: 'std-root',
  encapsulation: ViewEncapsulation.None,
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  @HostBinding('class.sidebar-collapsed') sidebarCollapsed = false;
  constructor() {

  }
}
