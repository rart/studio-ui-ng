import { Reducer } from 'redux';
import { StoreActionsEnum } from '../enums/actions.enum';
import { User } from '../models/user.model';

export const user: Reducer<User> = (state = null, action) => {
  switch (action.type) {
    case StoreActionsEnum.STUDIO_INIT: {
      return (state instanceof User)
        ? state
        : (state)
          ? User.deserialize(state)
          : state;
    }
    case StoreActionsEnum.LOGGED_IN:
      return action.payload.user;
    case StoreActionsEnum.LOGGED_OUT:
      return null;
    // case StoreActionsEnum.LOGIN:
    // case StoreActionsEnum.LOGOUT:
    // case StoreActionsEnum.SESSION_TIMEOUT:
    default:
      return state;
  }
};
