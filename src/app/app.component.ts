import { Router } from '@angular/router';
import { Component, HostBinding } from '@angular/core';
import { MatDialog } from '@angular/material';

import { Subject } from 'rxjs/Subject';
import { interval } from 'rxjs/observable/interval';
import { filter, switchMap, take, takeUntil } from 'rxjs/operators';

import { NgRedux, select } from '@angular-redux/store';
import { TranslateService } from '@ngx-translate/core';

import { AppState, StateEntity } from './classes/app-state.interface';
import { isNullOrUndefined } from 'util';
import { Project } from './models/project.model';
import { openDialog } from './utils/material.utils';
import { LoginComponent } from './components/login/login.component';
import { notNullOrUndefined } from './app.utils';
import { WithNgRedux } from './classes/with-ng-redux.class';
import { environment } from '../environments/environment';
import { UserService } from './services/user.service';

@Component({
  selector: 'std-app',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent extends WithNgRedux {

  auth = 'void';
  loginView = null;

  @HostBinding('class.sidebar-collapsed')
  sidebarCollapsed = false;

  @select(['sidebar', 'visible'])
  sidebarVisibility$;

  preRequisitesPassed = false;

  constructor(store: NgRedux<AppState>,
              translate: TranslateService,
              private authService: UserService,
              private dialog: MatDialog,
              private router: Router) {
    super(store);

    // this language will be used as a fallback when a translation
    // isn't found in the current language
    translate.setDefaultLang('en');

    // Add supported languages
    translate.addLangs(['en', 'es']);

    // the lang to use, if the lang isn't available, it will
    // use the current loader to get them
    translate.use('en');

    // - - - - - - - - - - - - - - - -

    this.select('auth')
      .pipe(filter(state => state !== 'fetching'))
      .subscribe((value: string) => {
        this.auth = value;
        if (value === 'void') {
          this.router.navigate(['/login']);
        }
        if ((value === 'void') || (value === 'timeout')) {
          if (isNullOrUndefined(this.loginView)) {
            this.loginView = openDialog(this.dialog, LoginComponent, {
              width: '400px',
              disableClose: true
            });
          }
        } else {
          if (notNullOrUndefined(this.loginView)) {
            this.loginView.close();
            this.loginView = null;
          }
          if (this.router.url === '/login') {
            // TODO this should go to last known route?
            this.router.navigate(['/']);
          }
          this.startSessionTimeoutInterval();
        }
      });

    this.sidebarVisibility$
      .subscribe((visible: boolean) => this.sidebarCollapsed = !visible);

    this.select<StateEntity<Project>>(['entities', 'projects'])
      .pipe(
        filter(data => data.loading.all === false),
        take(1)
      )
      .subscribe(() => {
        this.preRequisitesPassed = true;
      });

  }

  private startSessionTimeoutInterval() {
    let { authService } = this;

    // TODO: session keep-alive dialog...
    // let minutes = (environment.cfg.timeout / 60000);
    // Show session about to expire a 5 minutes before timeout
    // let checkInterval = (minutes < 5) ? (minutes - 1) : (minutes - 5);

    interval(environment.cfg.timeout)
      .pipe(
        // Stop the interval when the session times out or log out occurs
        takeUntil(
          this.select('auth').pipe(
            filter(x => (x === 'void') || (x === 'timeout')))),
        // Execute the session validation: if failed, the api will 401
        // and the logic above will handle the rest
        switchMap(() => authService.validateSession())
      );

  }

}
