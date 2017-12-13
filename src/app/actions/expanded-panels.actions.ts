import { AppState } from '../classes/app-state.interface';
import { SignedAction } from '../classes/signed-action.interface';
import { StoreActionsEnum } from '../enums/actions.enum';

const affects: Array<keyof AppState> = ['sitesState'];

export class ExpandedPanelsActions {
  static affects = affects;

  static expand(key: string, siteCode: string): SignedAction {
    return { type: StoreActionsEnum.EXPAND_PANEL, affects, key, siteCode };
  }

  static collapse(key: string, siteCode: string): SignedAction {
    return { type: StoreActionsEnum.COLLAPSE_PANEL, affects, key, siteCode };
  }

  static expandMany(keys: Array<string>, siteCode: string): SignedAction {
    return { type: StoreActionsEnum.EXPAND_PANELS, affects, keys, siteCode };
  }

  static collapseMany(keys: Array<string>, siteCode: string): SignedAction {
    return { type: StoreActionsEnum.COLLAPSE_PANELS, affects, keys, siteCode };
  }
}
