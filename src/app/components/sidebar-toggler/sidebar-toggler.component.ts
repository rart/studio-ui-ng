import { Component, HostListener, OnInit } from '@angular/core';
import { dispatch } from '@angular-redux/store';

@Component({
  selector: 'std-sidebar-toggler',
  templateUrl: './sidebar-toggler.component.html',
  styleUrls: ['./sidebar-toggler.component.scss']
})
export class SidebarTogglerComponent implements OnInit {

  constructor() { }

  ngOnInit() {

  }

  @HostListener('click')
  onClick() {
    this.toggle();
  }

  @dispatch()
  toggle() {
    return { type: 'TOGGLE_SIDEBAR' };
  }

}
