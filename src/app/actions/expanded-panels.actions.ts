import { AppState } from '../classes/app-state.interface';
import { SignedAction } from '../classes/signed-action.interface';
import { StoreActionsEnum } from '../enums/actions.enum';

const affects: Array<keyof AppState> = ['expandedPanels'];

export class ExpandedPanelsActions {
  static affects = affects;

  static expand(key: string): SignedAction {
    return { type: StoreActionsEnum.EXPAND_PANEL, affects, key };
  }

  static collapse(key: string): SignedAction {
    return { type: StoreActionsEnum.COLLAPSE_PANEL, affects, key };
  }

  static expandMany(keys: Array<string>): SignedAction {
    return { type: StoreActionsEnum.EXPAND_PANELS, affects, keys };
  }

  static collapseMany(keys: Array<string>): SignedAction {
    return { type: StoreActionsEnum.COLLAPSE_PANELS, affects, keys };
  }
}
