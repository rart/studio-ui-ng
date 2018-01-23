import { Component, OnInit } from '@angular/core';
import { dispatch, select } from '@angular-redux/store';
import { UserActions } from '../../actions/user.actions';
import { User } from '../../models/user.model';
import { Observable } from 'rxjs/Observable';

@Component({
  selector: 'std-user-menu',
  templateUrl: './user-menu.component.html',
  styleUrls: ['./user-menu.component.scss']
})
export class UserMenuComponent implements OnInit {

  @select('user')
  user$: Observable<User>;

  constructor() { }

  ngOnInit() {

  }

  @dispatch()
  logout() {
    return UserActions.loggedOut();
  }

}
