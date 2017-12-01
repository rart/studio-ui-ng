import { AppState } from '../classes/app-state.interface';
import { SignedAction } from '../classes/signed-action.interface';
import { StoreActionsEnum } from '../enums/actions.enum';

const affects: Array<keyof AppState> = ['expandedPaths'];

export class ExpandedPathsActions {
  static affects = affects;

  static expand(path: string): SignedAction {
    return { type: StoreActionsEnum.EXPAND_PATH, affects, path };
  }

  static collapse(path: string): SignedAction {
    return { type: StoreActionsEnum.COLLAPSE_PATH, affects, path };
  }

  static expandMany(paths: Array<string>): SignedAction {
    return { type: StoreActionsEnum.EXPAND_PATHS, affects, paths };
  }

  static collapseMany(paths: Array<string>): SignedAction {
    return { type: StoreActionsEnum.COLLAPSE_PATHS, affects, paths };
  }
}
