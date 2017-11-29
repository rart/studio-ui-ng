import { Reducer } from 'redux';
import { StoreActionsEnum } from '../enums/actions.enum';

const addOne = (state, key) => {
  return state.includes(key) ? state : [...state, key];
};

const removeOne = (state, key) => {
  return state.filter(stateItem => stateItem !== key);
};

// export const reducer: Reducer<Array<ExpansionPanelIdentifierKeys>> = (state = [], action) => {
export const expandedPanels: Reducer<Array<string>> = (state = [], action) => {
  switch (action.type) {

    case StoreActionsEnum.EXPAND_PANEL:
      return addOne(state, action.key);

    case StoreActionsEnum.COLLAPSE_PANEL:
      return removeOne(state, action.key);

    case StoreActionsEnum.EXPAND_PANELS:
      return action.keys.reduce((nextState, key) =>
        addOne(nextState, key), [...state]);

    case StoreActionsEnum.COLLAPSE_PANELS: {
      return action.keys.reduce((nextState, key) =>
        removeOne(nextState, key), [...state]);
    }

    default:
      return state;

  }
};
