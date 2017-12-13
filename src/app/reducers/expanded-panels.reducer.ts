import { Reducer } from 'redux';
import { StoreActionsEnum } from '../enums/actions.enum';
import { isNullOrUndefined } from 'util';

const addOne = (state, key) => {
  return isNullOrUndefined(state[key])
    ? { ...state, [key]: true }
    : state;
};

const removeOne = (state, key) => {
  let newState = {
    ...state
  };
  delete newState[key];
  return newState;
};

// export const reducer: Reducer<Array<ExpansionPanelIdentifierKeys>> = (state = [], action) => {
export const expandedPanels: Reducer<{ [key: string]: boolean }> = (state = {}, action) => {
  switch (action.type) {

    case StoreActionsEnum.EXPAND_PANEL:
      return addOne(state, action.key);

    case StoreActionsEnum.COLLAPSE_PANEL:
      return removeOne(state, action.key);

    case StoreActionsEnum.EXPAND_PANELS:
      return action.keys.reduce((nextState, key) => {
        nextState[key] = true;
        return nextState;
      }, { ...state });

    case StoreActionsEnum.COLLAPSE_PANELS: {
      return action.keys.reduce((nextState, key) => {
        delete nextState[key];
        return nextState;
      }, { ...state });
    }

    default:
      return state;

  }
};
