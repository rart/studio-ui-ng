import {Component, ViewEncapsulation} from '@angular/core';

@Component({
  selector: 'std-root',
  encapsulation: ViewEncapsulation.None,
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'app';
  sidebarCollapsed = false;
  constructor() {
    window['setSBC'] = (w) => {
      this.sidebarCollapsed = w;
    }
  }
}
