
import { Reducer, AnyAction } from 'redux';

import { Asset } from '../app/models/asset.model';
import { StoreActionsEnum } from '../app/enums/actions.enum';
import { SignedAction } from '../app/classes/signed-action.interface';
import { AppState } from '../app/classes/app-state.interface';

// enum Action List {
//   SELECT_ITEM = 'SELECT_ITEM',
//   DESELECT_ITEM = 'DESELECT_ITEM'
// }

const affects: Array<keyof AppState> = ['selectedItems'];

export class Actions {
  static affects = affects;

  static select(item: Asset): SignedAction {
    return {
      type: StoreActionsEnum.SELECT_ITEM,
      affects,
      item
    };
  }
  static deselect(item: Asset): SignedAction {
    return {
      type: StoreActionsEnum.DESELECT_ITEM,
      affects,
      item
    };
  }
  static selectMany(items: Asset[]): SignedAction {
    return {
      type: StoreActionsEnum.SELECT_ITEMS,
      affects,
      items
    };
  }
  static deselectMany(items: Asset[]): SignedAction {
    return {
      type: StoreActionsEnum.DESELECT_ITEMS,
      affects,
      items
    };
  }
}

const withoutItem = (state, item) => {
  return state.filter((stateItem) => stateItem.id !== item.id);
};

const addOne = (state, item) => {
  return [...withoutItem(state, item), item];
};

export const reducer: Reducer<Array<Asset>> = (state = [], action: AnyAction) => {
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

    default:
      // return state;
      return state.map((item) => (
        (item instanceof Asset) ? item : Asset.fromPO(item)
      ));
  }
};
