import { AnyAction, Reducer } from 'redux';
import { StoreActionsEnum } from '../enums/actions.enum';

export const activeProjectCode: Reducer<string> = (state = null, action: AnyAction) => {
  switch (action.type) {

    case StoreActionsEnum.SELECT_PROJECT:
      return action.code;

    case StoreActionsEnum.DESELECT_PROJECT:
      return null;

    default:
      return state;

  }
};
