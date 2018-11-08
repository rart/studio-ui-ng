import { Component, Input } from '@angular/core';

@Component({
  selector: 'std-global-nav',
  templateUrl: './global-nav.component.html',
  styleUrls: ['./global-nav.component.scss']
})
export class GlobalNavComponent {

  @Input() items = [];

  constructor() {

  }

}
