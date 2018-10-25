import { Reducer } from 'redux';
import { Actions } from '../enums/actions.enum';

const cleanse =
  (state) => Object.keys(state)
    .filter(key => !state[key])
    .forEach(key => delete state[key]);

export const expandedPaths: Reducer<any> = (state: any = {}, action) => {
  let nextState = Object.assign({}, state);
  switch (action.type) {
    case Actions.EXPAND_PATH: {
      nextState[action.key] = true;
      break;
    }
    case Actions.COLLAPSE_PATH: {
      delete nextState[action.key];
      break;
    }
    case Actions.EXPAND_PATHS: {
      action.keys.forEach(key => nextState[key] = true);
      break;
    }
    case Actions.COLLAPSE_PATHS: {
      action.keys.forEach(key => delete nextState[key]);
      break;
    }
    default:
      return state;
  }
  return nextState;
};
