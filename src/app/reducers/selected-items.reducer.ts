import { AnyAction, Reducer } from 'redux';

import { Asset } from '../models/asset.model';
import { StoreActionsEnum } from '../enums/actions.enum';

const withoutItem = (state, item) => {
  return state.filter((stateItem) => stateItem.id !== item.id);
};

const addOne = (state, item) => {
  return [...withoutItem(state, item), item];
};

export const selectedItems: Reducer<Array<Asset>> = (state = [], action: AnyAction) => {
  switch (action.type) {

    case StoreActionsEnum.SELECT_ITEM:
      return addOne(state, action.item);

    case StoreActionsEnum.DESELECT_ITEM:
      return withoutItem(state, action.item);

    case StoreActionsEnum.SELECT_ITEMS: {
      let nextState = [...state];
      action.items.forEach(item =>
        nextState = addOne(nextState, item));
      return nextState;
    }

    case StoreActionsEnum.DESELECT_ITEMS: {
      let nextState = [...state];
      action.items.forEach(item =>
        nextState = withoutItem(nextState, item));
      return nextState;
    }

    case StoreActionsEnum.STATE_INIT: {
      return state.map((item) => (
        (item instanceof Asset) ? item : Asset.deserialize(item)
      ));
    }

    default:
      return state;
  }
};
