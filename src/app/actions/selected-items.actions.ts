import { Asset } from '../models/asset.model';
import { SignedAction } from '../classes/signed-action.interface';
import { StoreActionsEnum } from '../enums/actions.enum';
import { AppState } from '../classes/app-state.interface';

const affects: Array<keyof AppState> = ['sitesState'];

export class SelectedItemsActions {
  static affects = affects;

  static select(id: string, siteCode: string): SignedAction {
    return {
      type: StoreActionsEnum.SELECT_ITEM,
      affects,
      siteCode,
      id
    };
  }

  static deselect(id: string, siteCode: string): SignedAction {
    return {
      type: StoreActionsEnum.DESELECT_ITEM,
      affects,
      siteCode,
      id
    };
  }

  static selectMany(ids: string[], siteCode: string): SignedAction {
    return {
      type: StoreActionsEnum.SELECT_ITEMS,
      affects,
      siteCode,
      ids
    };
  }

  static deselectMany(ids: string[], siteCode: string): SignedAction {
    return {
      type: StoreActionsEnum.DESELECT_ITEMS,
      affects,
      siteCode,
      ids
    };
  }
}
