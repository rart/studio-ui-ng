import { AnyAction, Reducer } from 'redux';
import { StoreActionsEnum } from '../enums/actions.enum';

export const selectedItems: Reducer<{ [key: string]: boolean }> = (state = {}, action: AnyAction) => {
  switch (action.type) {

    case StoreActionsEnum.SELECT_ITEM:
      return {
        ...state,
        [action.id]: true
      };

    case StoreActionsEnum.DESELECT_ITEM: {
      let nextState = { ...state };
      delete nextState[action.id];
      return nextState;
    }

    case StoreActionsEnum.SELECT_ITEMS: {
      let nextState =  { ...state };
      action.ids.forEach(id => nextState[id] = true);
      return nextState;
    }

    case StoreActionsEnum.DESELECT_ITEMS: {
      return Object.keys(state).reduce((nextState, key) => {
        delete nextState[key];
        return nextState;
      }, { ...state });
    }

    default:
      return state;
  }
};
