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
    default:
      return state;
  }
};
