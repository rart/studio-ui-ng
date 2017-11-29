import { Asset } from '../models/asset.model';
import { SignedAction } from './signed-action.interface';
import { StoreActionsEnum } from '../enums/actions.enum';
import { AppState } from './app-state.interface';

const affects: Array<keyof AppState> = ['selectedItems'];

export class SelectedItemsActions {
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
