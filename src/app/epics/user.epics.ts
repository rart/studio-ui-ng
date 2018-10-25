import { Injectable } from '@angular/core';
import { map } from 'rxjs/operators';
import { Actions } from '../enums/actions.enum';
import { RootEpic } from './root.epic';
import { UserService } from '../services/user.service';
import {
  createUserComplete,
  deleteUserComplete,
  fetchUserComplete,
  fetchUsersComplete, loginComplete, logoutComplete, recoverComplete,
  updateUserComplete
} from '../actions/user.actions';
import { BaseEpic } from './base-epic';

@Injectable()
export class UserEpics extends BaseEpic {

  constructor(private service: UserService) {
    super();
  }

  private login = RootEpic.createEpic(
    Actions.LOGIN,
    ({ payload }) => {
      return this.service
        .login(payload.user)
        .pipe(
          map(loginComplete)
        );
    });

  private logout = RootEpic.createEpic(
    Actions.LOGOUT,
    () => {
      return this.service
        .logout()
        .pipe(
          map(logoutComplete)
        );
    });

  private recover = RootEpic.createEpic(
    Actions.RECOVER_PASSWORD,
    () => this.service
      .logout()
      .pipe(
        map(recoverComplete)
      ));

  private fetchUsers = RootEpic.createEpic(
    Actions.FETCH_USERS,
    (action) => this.service.page(action.payload.query)
      .pipe(
        map(fetchUsersComplete)
      )
  );

  private fetchUser = RootEpic.createEpic(
    Actions.FETCH_USER,
    (action) => this.service.byId(action.payload.id)
      .pipe(
        map(fetchUserComplete)
      )
  );

  private createUser = RootEpic.createEpic(
    Actions.CREATE_USER,
    (action) => this.service.create(action.payload.user)
      .pipe(
        map(createUserComplete)
      )
  );

  private deleteUser = RootEpic.createEpic(
    Actions.DELETE_USER,
    (action) => this.service.delete(action.payload.id).pipe(
      map(deleteUserComplete)
    )
  );

  private updateUser = RootEpic.createEpic(
    Actions.UPDATE_USER,
    (action) => this.service.update(action.payload.user)
      .pipe(
        map(updateUserComplete)
      )
  );

  protected manifest: string[] = [
    'login',
    'logout',
    'recover',
    'createUser',
    'updateUser',
    'deleteUser',
    'fetchUser',
    'fetchUsers',
  ];

}
