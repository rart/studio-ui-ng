import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ActivatedRoute } from '@angular/router';
import { MatDialog } from '@angular/material';
import { UserService } from '../../services/user.service';
import { dispatch, NgRedux, select } from '@angular-redux/store';
import { Observable } from 'rxjs/Observable';
import { AppState, ListingViewState, LookupTable, Settings } from '../../classes/app-state.interface';
import { User } from '../../models/user.model';
import { fetchUsers } from '../../actions/user.actions';
import { WithNgRedux } from '../../classes/with-ng-redux.class';
import { createKey } from '../../utils/state.utils';
import { combineLatest } from 'rxjs/observable/combineLatest';
import { PAGE_SIZE_OPTIONS } from '../../app.utils';
import { Query } from '../../models/query';
import { take } from 'rxjs/operators';

@Component({
  selector: 'std-user-management',
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.scss']
})
export class UsersComponent extends WithNgRedux implements OnInit {

  @select('settings')
  settings$: Observable<Settings>;

  users = [];
  query: Query;
  loading: boolean = true;
  totalNumOfUsers = 0;
  pageSizeOptions = PAGE_SIZE_OPTIONS;

  constructor(private userService: UserService,
              private activeRoute: ActivatedRoute,
              public dialog: MatDialog,
              public router: Router,
              store: NgRedux<AppState>) {
    super(store);
  }

  ngOnInit() {

    const { store } = this;

    combineLatest(
      store.select(['entities', 'users', 'byId']),
      store.select('usersList')
    ).pipe(
      this.untilDestroyed()
    ).subscribe((values: any[]) => {
      const
        byId: LookupTable<User> = values[0],
        state: ListingViewState = values[1],
        index = state.query.pageIndex;
      this.query = state.query;
      this.loading = !!state.loading[createKey('PAGE', index)];
      this.users = (state.page[index])
        ? Array.prototype.map.call(state.page[index], (username) => byId[username])
        : [];
      this.totalNumOfUsers = state.total;
    });

    store.select('usersList').pipe(
      take(1),
      this.untilDestroyed(),
    ).subscribe((state: ListingViewState) => this.fetchUsers(state.query));

  }

  @dispatch()
  fetchUsers(query: Query = this.query, forceUpdate = false) {
    return fetchUsers(query, forceUpdate);
  }

  createUser() {
    this.router.navigate(['/users/create']);
  }

  editUser(user) {
    this.router.navigate(['/users/edit', user.username]);
  }

  pageChanged($event: Query/*PageEvent*/) {
    return this.fetchUsers($event);
  }

}
