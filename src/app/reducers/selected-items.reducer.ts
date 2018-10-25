import { AnyAction, Reducer } from 'redux';
import { Actions } from '../enums/actions.enum';

export const selectedItems: Reducer<{ [key: string]: boolean }> = (state = {}, action: AnyAction) => {
  switch (action.type) {

    case Actions.SELECT_ITEM:
      return {
        ...state,
        [action.id]: true
      };

    case Actions.DESELECT_ITEM: {
      let nextState = { ...state };
      delete nextState[action.id];
      return nextState;
    }

    case Actions.SELECT_ITEMS: {
      let nextState =  { ...state };
      action.ids.forEach(id => nextState[id] = true);
      return nextState;
    }

    case Actions.DESELECT_ITEMS: {
      return Object.keys(state).reduce((nextState, key) => {
        delete nextState[key];
        return nextState;
      }, { ...state });
    }

    default:
      return state;
  }
};
