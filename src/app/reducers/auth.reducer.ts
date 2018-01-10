import { Reducer } from 'redux';
import { StoreActionsEnum } from '../enums/actions.enum';

export const auth: Reducer<string> = (state = 'void', action) => {
  switch (action.type) {
    case StoreActionsEnum.LOGIN:
      return 'fetching';
    case StoreActionsEnum.LOGGED_IN:
      return 'validated';
    case StoreActionsEnum.LOGOUT:
      return 'fetching';
    case StoreActionsEnum.LOGGED_OUT:
      return 'void';
    case StoreActionsEnum.SESSION_TIMEOUT:
      return 'timeout';
    default:
      return state;
  }
};
