import { Reducer } from 'redux';
import { Actions } from '../enums/actions.enum';
import { AuthState } from '../classes/app-state.interface';

export const auth: Reducer<AuthState> = (state = 'void', action) => {
  switch (action.type) {
    case Actions.LOGIN:
      return 'fetching';
    case Actions.LOGGED_IN:
      return 'validated';
    case Actions.LOGOUT:
      return 'fetching';
    case Actions.LOGGED_OUT:
      return 'void';
    case Actions.SESSION_TIMEOUT:
      return 'timeout';
    default:
      return state;
  }
};
