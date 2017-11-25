import { Reducer } from 'redux';
import { StoreActionsEnum } from '../app/enums/actions.enum';
import { AppState } from '../app/classes/app-state.interface';
import { SignedAction } from '../app/classes/signed-action.interface';

// enum ActionsList {
//   EXPAND_PANEL = 'EXPAND_PANEL',
//   COLLAPSE_PANEL = 'COLLAPSE_PANEL',
//   EXPAND_PANELS = 'EXPAND_PANELS',
//   COLLAPSE_PANELS = 'COLLAPSE_PANELS'
// }

// state = {
//   ...
//   expandedPanels: Array<ExpansionPanelIdentifierKeys>;
//   ...
// }

// export type ExpansionPanelIdentifierKeys =
//   '' |
//   '' ;

export class Actions {
  static affects: Array<keyof AppState> = ['expandedPanels'];

  static expand(key: string): SignedAction {
    return { type: StoreActionsEnum.EXPAND_PANEL, affects: Actions.affects, key };
  }

  static collapse(key: string): SignedAction {
    return { type: StoreActionsEnum.COLLAPSE_PANEL, affects: Actions.affects, key };
  }

  static expandMany(keys: Array<string>): SignedAction {
    return { type: StoreActionsEnum.EXPAND_PANELS, affects: Actions.affects, keys };
  }

  static collapseMany(keys: Array<string>): SignedAction {
    return { type: StoreActionsEnum.COLLAPSE_PANELS, affects: Actions.affects, keys };
  }
}

const addOne = (state, key) => {
  return state.includes(key) ? state : [...state, key];
};

const removeOne = (state, key) => {
  return state.filter(stateItem => stateItem !== key);
};

// export const reducer: Reducer<Array<ExpansionPanelIdentifierKeys>> = (state = [], action) => {
export const reducer: Reducer<Array<string>> = (state = [], action) => {
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
