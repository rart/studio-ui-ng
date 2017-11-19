import {
  Reducer,
  AnyAction
} from 'redux';
import {ArrayUtils} from '../app/app.utils';
import {ActionTypesList} from './actions.enum';

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
  static expand(key: string): AnyAction {
    return {type: ActionTypesList.EXPAND_PANEL, key};
  }

  static collapse(key: string): AnyAction {
    return {type: ActionTypesList.COLLAPSE_PANEL, key};
  }

  static expandMany(keys: Array<string>): AnyAction {
    return {type: ActionTypesList.EXPAND_PANELS, keys};
  }

  static collapseMany(keys: Array<string>): AnyAction {
    return {type: ActionTypesList.COLLAPSE_PANELS, keys};
  }
}

// export const reducer: Reducer<Array<ExpansionPanelIdentifierKeys>> = (state = [], action) => {
export const reducer: Reducer<Array<string>> = (state = [], action) => {
  switch (action.type) {

    case ActionTypesList.EXPAND_PANEL:
      return ArrayUtils.contains(state, action.key) ? state : [action.key, ...state];

    case ActionTypesList.COLLAPSE_PANEL:
      return state.filter(stateItem => stateItem !== action.key);

    case ActionTypesList.EXPAND_PANELS: {
      let newState = [...state];
      action.keys.forEach(key => {
        newState = reducer(newState, Actions.expand(key));
      });
      return newState;
    }

    case ActionTypesList.COLLAPSE_PANELS: {
      let newState = [...state];
      action.keys.forEach(key => {
        newState = reducer(newState, Actions.collapse(key));
      });
      console.log(newState);
      return newState;
    }

    default:
      return state;

  }
};
