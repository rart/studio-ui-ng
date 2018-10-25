import { AnyAction, Reducer } from 'redux';
import { Actions } from '../enums/actions.enum';

export const activeProjectCode: Reducer<string> = (state = null, action: AnyAction) => {
  switch (action.type) {

    case Actions.SELECT_PROJECT:
      return action.code;

    case Actions.DESELECT_PROJECT:
      return null;

    default:
      return state;

  }
};
