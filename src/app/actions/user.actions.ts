import { AppState } from '../classes/app-state.interface';
import { SignedAction } from '../classes/signed-action.interface';
import { StoreActionsEnum } from '../enums/actions.enum';
import { User } from '../models/user.model';

const affects: Array<keyof AppState> = ['user', 'auth'];

export class UserActions {

  static login(user: User): SignedAction {
    return { affects, type: StoreActionsEnum.LOGIN, payload: { user } };
  }

  static loggedIn(user: User): SignedAction {
    return { affects, type: StoreActionsEnum.LOGGED_IN, payload: { user } };
  }

  static logout(): SignedAction {
    return { affects, type: StoreActionsEnum.LOGOUT };
  }

  static loggedOut(): SignedAction {
    return { affects, type: StoreActionsEnum.LOGGED_OUT };
  }

  static timeout(): SignedAction {
    return { affects, type: StoreActionsEnum.SESSION_TIMEOUT };
  }

  static recover(user: User) {
    return { affects, type: StoreActionsEnum.RECOVER_PASSWORD, payload: { user } };
  }

  static recovered(user: User) {
    return { affects, type: StoreActionsEnum.RECOVER_PASSWORD, payload: { user } };
  }

}
