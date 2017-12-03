import { SignedAction } from '../classes/signed-action.interface';
import { StoreActionsEnum } from '../enums/actions.enum';
import { AppState } from '../classes/app-state.interface';
import { PreviewTab } from '../classes/preview-tab.class';

const affects: Array<keyof AppState> = ['previewTabs'];

export class PreviewTabsActions {
  static affects = affects;

  static nav(tab: PreviewTab): SignedAction {
    return {
      type: StoreActionsEnum.NAVIGATE_ON_ACTIVE,
      affects,
      tab
    };
  }

  static open(tab: PreviewTab): SignedAction {
    return {
      type: StoreActionsEnum.OPEN_TAB,
      affects,
      tab
    };
  }

  static openInBackground(tab: PreviewTab): SignedAction {
    return {
      type: StoreActionsEnum.OPEN_TAB_BACKGROUND,
      affects,
      tab
    };
  }

  static close(id: PreviewTab): SignedAction {
    return {
      type: StoreActionsEnum.CLOSE_TAB,
      affects,
      id
    };
  }

  static select(id: PreviewTab): SignedAction {
    return {
      type: StoreActionsEnum.SELECT_TAB,
      affects,
      id
    };
  }

  // static navigate()

}
