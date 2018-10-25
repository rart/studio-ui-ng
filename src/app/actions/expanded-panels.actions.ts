import { AppState } from '../classes/app-state.interface';
import { SignedAction } from '../classes/signed-action.interface';
import { Actions } from '../enums/actions.enum';

const affects: Array<keyof AppState> = ['workspaces'];

export class ExpandedPanelsActions {
  static affects = affects;

  static expand(key: string, projectCode: string): SignedAction {
    return { type: Actions.EXPAND_PANEL, affects, key, projectCode };
  }

  static collapse(key: string, projectCode: string): SignedAction {
    return { type: Actions.COLLAPSE_PANEL, affects, key, projectCode };
  }

  static expandMany(keys: Array<string>, projectCode: string): SignedAction {
    return { type: Actions.EXPAND_PANELS, affects, keys, projectCode };
  }

  static collapseMany(keys: Array<string>, projectCode: string): SignedAction {
    return { type: Actions.COLLAPSE_PANELS, affects, keys, projectCode };
  }
}
