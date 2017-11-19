
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
}

export const reducer: Reducer<Array<ContentItem>> = (state = [], action: AnyAction) => {
  const item = action.item;
  switch (action.type) {
    case ActionTypesList.SELECT_ITEM:
      return [...state, item];
    case ActionTypesList.DESELECT_ITEM:
      return state.filter(stateItem => item.id !== stateItem.id);
    default:
      return state;
  }
};
