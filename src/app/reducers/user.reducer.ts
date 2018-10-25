import { Reducer } from 'redux';
import { Actions } from '../enums/actions.enum';
import { User } from '../models/user.model';

export const user: Reducer<User> = (state = null, action) => {
  switch (action.type) {
    case Actions.LOGGED_IN:
      return action.payload.user;
    case Actions.LOGGED_OUT:
      return null;
    // case Actions.LOGIN:
    // case Actions.LOGOUT:
    // case Actions.SESSION_TIMEOUT:
    default:
      return state;
  }
};
