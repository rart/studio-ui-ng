
import {
  Reducer,
  AnyAction
} from 'redux';

import {ContentItem} from '../app/models/content-item.model';
import {ActionTypesList} from './actions.enum';

// enum Action List {
//   SELECT_ITEM = 'SELECT_ITEM',
//   DESELECT_ITEM = 'DESELECT_ITEM'
// }

export class Actions {
  static select(item: ContentItem): AnyAction {
    return {
      type: ActionTypesList.SELECT_ITEM,
      item
    };
  }
  static deselect(item: ContentItem): AnyAction {
    return {
      type: ActionTypesList.DESELECT_ITEM,
      item
    };
  }
  static selectMany(items: ContentItem[]): AnyAction {
    return {
      type: ActionTypesList.SELECT_ITEMS,
      items
    };
  }
  static deselectMany(items: ContentItem[]): AnyAction {
    return {
      type: ActionTypesList.DESELECT_ITEMS,
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

export const reducer: Reducer<Array<ContentItem>> = (state = [], action: AnyAction) => {
  switch (action.type) {

    case ActionTypesList.SELECT_ITEM:
      return addOne(state, action.item);
    case ActionTypesList.DESELECT_ITEM:
      return withoutItem(state, action.item);

    case ActionTypesList.SELECT_ITEMS: {
      let nextState = [...state];
      action.items.forEach(item =>
        nextState = addOne(nextState, item));
      return nextState;
    }

    case ActionTypesList.DESELECT_ITEMS: {
      let nextState = [...state];
      action.items.forEach(item =>
        nextState = withoutItem(nextState, item));
      return nextState;
    }

    default:
      return state;
  }
};
