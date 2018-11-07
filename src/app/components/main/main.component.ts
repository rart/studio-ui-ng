import { Component, HostBinding, OnInit } from '@angular/core';
import { NgRedux } from '@angular-redux/store';
import { AppState, Settings, SidebarState } from '../../classes/app-state.interface';
import { WithNgRedux } from '../../classes/with-ng-redux.class';
import { combineLatest, filter, withLatestFrom } from 'rxjs/operators';
import { routerAnimations } from '../../utils/animations.utils';
import { NavigationEnd, Router } from '@angular/router';
import { notNullOrUndefined } from '../../app.utils';
import { StudioService } from '../../services/studio.service';

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

  showProjectSidebar = false;
  showProjectBadge = false;
  activeProjectCode = '';

  settings: Settings = (<Settings>{});
  navState = '';

  globalNavItems = [];
  projectNavItems = [];
  projectTreeItems = [];

  constructor(store: NgRedux<AppState>,
              studioService: StudioService,
              router: Router) {
    super(store);

    router.events
      .pipe(
        filter(event => event instanceof NavigationEnd),
        combineLatest(
          store.select<string>('activeProjectCode'),
          store.select<Settings>('settings')
        ),
        this.untilDestroyed()
      )
      .subscribe(([event, code, settings]) => {

        this.settings = settings;
        this.navState = this.settings.viewAnimation;
        this.showProjectBadge = notNullOrUndefined(code);
        this.showProjectSidebar = notNullOrUndefined(code) && router.url.includes('/project/') && settings.navBarShown;
        this.activeProjectCode = code;

        setTimeout(() => this.navState = '', 500);

      });

    studioService
      .getGlobalNav()
      .subscribe((navItems) => {
        this.globalNavItems = navItems.studio;
        this.projectNavItems = navItems.project.nav;
        this.projectTreeItems = navItems.project.trees;
      });

  }

  ngOnInit() {

  }

}
