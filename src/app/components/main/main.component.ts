import { Component, HostBinding, OnInit } from '@angular/core';
import { NgRedux, select } from '@angular-redux/store';
import { AppState, Settings } from '../../classes/app-state.interface';
import { WithNgRedux } from '../../classes/with-ng-redux.class';
import { filter, map, takeUntil } from 'rxjs/operators';
import { routerAnimations } from '../../utils/animations.utils';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';

@Component({
  selector: 'std-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.scss'],
  animations: routerAnimations
})
export class MainComponent extends WithNgRedux implements OnInit {

  @HostBinding('attr.max-width')
  get containedLayoutMaxWidth() {
    return ((this.settings)
      ? this.settings.layout === 'contained' ? this.settings.containedLayoutMax : false
      : false);
  }

  @select('settings')
  settings$;

  settings: Settings;
  navState = '';

  constructor(store: NgRedux<AppState>,
              private router: Router) {
    super(store);
  }

  ngOnInit() {
    this.settings$
      .pipe(takeUntil(this.unSubscriber$))
      .subscribe((settings) => this.settings = settings);
    this.router.events
      .pipe(
        filter((event) => event instanceof NavigationEnd))
      .subscribe(() => {
        this.navState = this.settings.viewAnimation;
        setTimeout(() => this.navState = '', 500);
      });
  }

}
