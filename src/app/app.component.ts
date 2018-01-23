import { Component, HostBinding, OnInit, ViewEncapsulation } from '@angular/core';
import { AppState, StateEntity } from './classes/app-state.interface';
import { NgRedux, select } from '@angular-redux/store';
import { Observable } from 'rxjs/Observable';
import { isNullOrUndefined } from 'util';
import { Project } from './models/project.model';
import { Subject } from 'rxjs/Subject';
import { filter, takeUntil } from 'rxjs/operators';
import { MatDialog } from '@angular/material';
import { openDialog } from './utils/material.utils';
import { LoginComponent } from './components/login/login.component';
import { notNullOrUndefined } from './app.utils';
import { Router } from '@angular/router';
import { WithNgRedux } from './classes/with-ng-redux.class';

@Component({
  selector: 'std-app',
  // encapsulation: ViewEncapsulation.None,
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent extends WithNgRedux implements OnInit {

  loginView = null;

  @HostBinding('class.sidebar-collapsed')
  sidebarCollapsed = false;

  @select(['entities', 'projects'])
  projectsEntity$: Observable<StateEntity<Project>>;

  @select(['sidebar', 'visible'])
  sidebarVisibility$;

  auth$;

  preRequisitesPassed = false;
  preRequisitesPassed$ = new Subject();

  constructor(store: NgRedux<AppState>,
              private dialog: MatDialog,
              private router: Router) {
    super(store);
  }

  ngOnInit() {

    this.auth$ = this.select('auth')
      .pipe(filter(state => state !== 'fetching'));

    this.auth$
      .subscribe((value) => {
        if (value === 'void') {
          this.router.navigate(['/login']);
        }
        if ((value === 'void') || (value === 'timeout')) {
          this.loginView = openDialog(this.dialog, LoginComponent, {
            width: '400px',
            disableClose: true
          });
        } else {
          if (notNullOrUndefined(this.loginView)) {
            this.loginView.close();
            this.loginView = null;
          }
          if (this.router.url === '/login') {
            this.router.navigate(['/']);
          }
        }
      });

    this.sidebarVisibility$
      .subscribe((visible: boolean) => this.sidebarCollapsed = !visible);

    this.projectsEntity$
      .pipe(takeUntil(this.preRequisitesPassed$))
      .subscribe(data => {
        if (this.preRequisitesPassed = !isNullOrUndefined(data.byId)) {
          this.preRequisitesPassed$.next();
        }
      });

  }

}
