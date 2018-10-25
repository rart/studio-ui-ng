import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { PageEvent } from '@angular/material';
import { ActivatedRoute } from '@angular/router';
import { MatDialog } from '@angular/material';
import { UserService } from '../../services/user.service';
import { openDialog } from '../../utils/material.utils';
import { UserFormComponent } from './user-form/user-form.component';
import { dispatch, NgRedux, select } from '@angular-redux/store';
import { Observable } from 'rxjs/Observable';
import { AppState, ListingViewState, LookupTable, Settings } from '../../classes/app-state.interface';
import { User } from '../../models/user.model';
import { fetchUsers } from '../../actions/user.actions';
import { withLatestFrom } from 'rxjs/operators';
import { WithNgRedux } from '../../classes/with-ng-redux.class';

declare var $;

@Component({
  selector: 'std-user-management',
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.scss']
})
export class UsersComponent extends WithNgRedux implements OnInit {

  @select('settings')
  settings$: Observable<Settings>;

  hasChild = false;
  childComponent = null;

  users = [];
  loading: LookupTable<boolean> = {};
  pageSize = 5;
  pageIndex = 0;
  totalNumOfUsers = 0;
  pageSizeOptions = [5, 10, 25, 100];

  constructor(private userService: UserService,
              private activeRoute: ActivatedRoute,
              public dialog: MatDialog,
              public router: Router,
              store: NgRedux<AppState>) {
    super(store);
    // Take advantage or be respectful of client screen by
    // showing more or less results
    /*this.pageSize = ($(window).height() > 600)
      ? this.pageSizeOptions[1]
      : this.pageSizeOptions[0];*/
    /*this.subs = Observable.fromEvent(window, 'resize')
      .delay(500)
      .subscribe((e) => console.log(e)); */
  }

  ngOnInit() {

    const { store, activeRoute } = this;

    store.select(['entities', 'users', 'loading'])
      .pipe(this.untilDestroyed())
      .subscribe((data: LookupTable<boolean>) => this.loading = data);

    store.select(['entities', 'users', 'byId'])
      .pipe(
        withLatestFrom(
          store.select('usersList'),
          (a, b) => ({ byId: a, state: b })
        ),
        this.untilDestroyed()
      )
      .subscribe(({ byId, state }: { byId: LookupTable<User>, state: ListingViewState }) => {
        this.users = Object.values(byId);
        this.totalNumOfUsers = state.total;
      });

    activeRoute.queryParams
      .subscribe(params => {
        const pageSize = params['pageSize'];
        const pageIndex = params['pageIndex'];
        const create = params['create'];
        const edit = params['edit'];
        const state = {
          pageSize: this.pageSize,
          pageIndex: this.pageIndex,
          users: this.users
        };

        if (pageSize !== undefined) {
          this.pageSize = pageSize;
        }
        if (pageIndex !== undefined) {
          this.pageIndex = pageIndex;
        }

        // TODO: fetch only when changed
        this.fetchUsers();

        // Something fails when opening dialogs without the setTimeout

        if (create !== undefined) {
          setTimeout(() => this.openDialog());
        }

        if (edit !== undefined && edit !== '') {
          setTimeout(() => this.openDialog({ username: edit }));
        }

      });
  }

  @dispatch()
  fetchUsers() {
    return fetchUsers({
      offset: (this.pageIndex * this.pageSize),
      limit: this.pageSize
    });
  }

  createUser() {
    if (this.useModal()) {
      this.router.navigate(['/users'], { queryParams: { create: 'true' } });
    } else {
      this.router.navigate(['/users/create']);
    }
  }

  editUser(user) {
    if (this.useModal()) {
      this.router.navigate(['/users'], { queryParams: { edit: user.username } });
    } else {
      this.router.navigate(['/users/edit', user.username]);
    }
  }

  private useModal() {
    return $(window).width() < 1350;
  }

  openDialog(data = {}) {
    let dialogRef;
    dialogRef = openDialog(this.dialog, UserFormComponent, {
      width: '800px',
      height: '80vh',
      panelClass: ['no', 'pad', 'dialog'],
      disableClose: true,
      data
    });
    dialogRef.afterClosed()
      .subscribe(() => {
        this.editFinished();
      });
    dialogRef.componentInstance.finished
      .subscribe(() => {
        dialogRef.close();
      });
  }

  editFinished() {
    this.router.navigate(['/users']);
  }

  pageChanged($event: PageEvent) {
    this.router.navigate(['/users'], {
      queryParams: { pageIndex: $event.pageIndex, pageSize: $event.pageSize }
    });
  }

  componentAdded(event) {
    this.hasChild = true;
    this.childComponent = event;
  }

  componentRemoved(event) {
    this.hasChild = false;
    this.childComponent = null;
  }

  userSelected(user) {
    this.router.navigate(['/users/edit', user.username]);
  }
}
