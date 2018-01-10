import { Component, OnInit } from '@angular/core';
import { dispatch } from '@angular-redux/store';
import { UserActions } from '../../../actions/user.actions';

@Component({
  selector: 'std-user-profile',
  templateUrl: './user-profile.component.html',
  styleUrls: ['./user-profile.component.scss']
})
export class UserProfileComponent implements OnInit {

  constructor() { }

  ngOnInit() {

  }

  @dispatch()
  logout() {
    return UserActions.loggedOut();
  }

}
