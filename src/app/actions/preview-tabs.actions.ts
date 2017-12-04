import { SignedAction } from '../classes/signed-action.interface';
import { StoreActionsEnum } from '../enums/actions.enum';
import { AppState } from '../classes/app-state.interface';
import { PreviewTab } from '../classes/preview-tab.class';
import { Asset } from '../models/asset.model';

const affects: Array<keyof AppState> = ['previewTabs'];

interface TabProps {
  url: string;
  siteCode: string;
  title?: string;
  asset?: Asset;
}

interface TabWithAsset extends TabProps {
  asset: Asset;
}

export class PreviewTabsActions {
  static affects = affects;

  static nav(tab: TabProps): SignedAction {
    return {
      type: StoreActionsEnum.NAVIGATE_ON_ACTIVE,
      affects,
      tab
    };
  }

  static edit(tab: TabWithAsset): SignedAction {
    return {
      type: StoreActionsEnum.EDIT_ASSET,
      affects,
      tab
    };
  }

  static open(tab: TabProps): SignedAction {
    return {
      type: StoreActionsEnum.OPEN_TAB,
      affects,
      tab
    };
  }

  static openInBackground(tab: TabProps): SignedAction {
    return {
      type: StoreActionsEnum.OPEN_TAB_BACKGROUND,
      affects,
      tab
    };
  }

  static close(id: string): SignedAction {
    return {
      type: StoreActionsEnum.CLOSE_TAB,
      affects,
      id
    };
  }

  static select(id: string): SignedAction {
    return {
      type: StoreActionsEnum.SELECT_TAB,
      affects,
      id
    };
  }

  // static navigate()

}
