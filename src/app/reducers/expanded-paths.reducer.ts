import { Reducer } from 'redux';
import { StoreActionsEnum } from '../enums/actions.enum';

export const expandedPaths: Reducer<any> = (state: any = {}, action) => {
  let nextState = Object.assign({}, state);
  switch (action.type) {
    case StoreActionsEnum.EXPAND_PATH: {
      nextState[action.key] = true;
      break;
    }
    case StoreActionsEnum.COLLAPSE_PATH: {
      delete nextState[action.key];
      break;
    }
    case StoreActionsEnum.EXPAND_PATHS: {
      action.keys.forEach((k) => nextState[k] = true);
      break;
    }
    case StoreActionsEnum.COLLAPSE_PATHS: {
      action.keys.forEach((k) => delete nextState[k]);
      break;
    }
    default: return state;
  }
  return nextState;
};
