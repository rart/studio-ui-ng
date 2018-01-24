import { AppState, Settings } from '../classes/app-state.interface';
import { SignedAction } from '../classes/signed-action.interface';
import { StoreActionsEnum } from '../enums/actions.enum';

const affects: Array<keyof AppState> = ['settings'];

export class SettingsActions {

  static updateOne(key: keyof Settings, value: any): SignedAction {
    return { affects, type: StoreActionsEnum.UPDATE_SETTINGS, payload: { key, value } };
  }

  static updateMany(nextSettings): SignedAction {
    return { affects, type: StoreActionsEnum.UPDATE_SETTINGS, payload: nextSettings };
  }

  static toggleSideBar(): SignedAction {
    return { affects, type: StoreActionsEnum.TOGGLE_SIDEBAR };
  }

  static toggleSideBarFolded(): SignedAction {
    return { affects, type: StoreActionsEnum.TOGGLE_SIDEBAR_FOLD };
  }

}
