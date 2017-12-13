import { AnyAction, Reducer } from 'redux';
import { StoreActionsEnum } from '../enums/actions.enum';

export const activeSiteCode: Reducer<string> = (state = null, action: AnyAction) => {
  switch (action.type) {

    case StoreActionsEnum.SELECT_SITE:
      return action.code;

    case StoreActionsEnum.DESELECT_SITE:
      return null;

    default:
      return state;

  }
};
