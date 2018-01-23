import { AppState } from '../classes/app-state.interface';
import { SignedAction } from '../classes/signed-action.interface';
import { StoreActionsEnum } from '../enums/actions.enum';

const affects: Array<keyof AppState> = ['settings'];

export class SettingsActions {

  static toggleSideBar(): SignedAction {
    return { affects, type: StoreActionsEnum.TOGGLE_SIDEBAR };
  }

  static toggleSideBarFolded(): SignedAction {
    return { affects, type: StoreActionsEnum.TOGGLE_SIDEBAR_FOLD };
  }

}
