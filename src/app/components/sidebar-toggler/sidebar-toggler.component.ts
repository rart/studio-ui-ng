import { Component, HostListener, OnInit } from '@angular/core';
import { dispatch } from '@angular-redux/store';
import { SettingsActions } from '../../actions/settings.actions';

@Component({
  selector: 'std-sidebar-toggler',
  templateUrl: './sidebar-toggler.component.html',
  styleUrls: ['./sidebar-toggler.component.scss']
})
export class SidebarTogglerComponent implements OnInit {

  labelKey = 'Toggle Side Bar';

  constructor() { }

  ngOnInit() {

  }

  @HostListener('click')
  onClick() {
    this.toggle();
  }

  @dispatch()
  toggle() {
    return SettingsActions.toggleSideBar();
  }

}
