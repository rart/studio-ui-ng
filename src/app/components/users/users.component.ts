import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { dispatch, NgRedux } from '@angular-redux/store';
import { fetchUsers } from '../../actions/user.actions';
import { User } from '../../models/user.model';
import { AppState } from '../../classes/app-state.interface';
import { Query } from '../../models/query';
import { ListingView } from '../../classes/listing-view.class';

@Component({
  selector: 'std-user-management',
  styleUrls: ['./users.component.scss'],
  template: ListingView.createTemplate({
    listTemplate: `
    <mat-card class="pad all" max="readability">
      <std-user-list (selected)="edit($event)" [users]="entities"></std-user-list>
    </mat-card>`
  })
})
export class UsersComponent extends ListingView<User> {

  titleBarTitle = 'Users';
  titleBarIcon = 'people';

  constructor(store: NgRedux<AppState>, private router: Router) {
    super(store, 'users', 'usersList');
  }

  @dispatch()
  fetch(query: Query = this.query, forceUpdate = false) {
    return fetchUsers(query, forceUpdate);
  }

  create(): void {
    this.router.navigate(['/users/create']);
  }

  edit(user: User): void {
    this.router.navigate(['/users/edit', user.username]);
  }

}
