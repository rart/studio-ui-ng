import { Injectable } from '@angular/core';
import { map } from 'rxjs/operators';
import { StoreActionsEnum } from '../enums/actions.enum';
import { RootEpic } from './root.epic';
import { UserService } from '../services/user.service';
import { UserActions } from '../actions/user.actions';
import { BaseEpic } from './base-epic';

@Injectable()
export class UserEpics extends BaseEpic {

  protected manifest: string[] = [
    'login',
    'logout',
    'recover'
  ];

  constructor(private service: UserService) {
    super();
  }

  private login = RootEpic.createEpic(
    StoreActionsEnum.LOGIN,
    ({ payload }) => {
      return this.service
        .login(payload.user)
        .pipe(
          map(UserActions.loggedIn)
        );
    });

  private logout = RootEpic.createEpic(
    StoreActionsEnum.LOGOUT,
    () => {
      return this.service
        .logout()
        .pipe(
          map(UserActions.loggedOut)
        );
    });

  private recover = RootEpic.createEpic(
    StoreActionsEnum.RECOVER_PASSWORD,
    () => {
      return this.service
        .logout()
        .pipe(
          map(UserActions.recovered)
        );
    });

}
