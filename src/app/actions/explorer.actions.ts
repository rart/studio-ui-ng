import { Project } from '../models/project.model';
import { StoreActionsEnum } from '../enums/actions.enum';
import { Asset } from '../models/asset.model';

export class ExplorerActions {

  static selectProject(projectCode: string) {
    return {
      type: StoreActionsEnum.EXPLORER_SELECT_PROJECT,
      payload: { projectCode, root: '/' }
    };
  }

  static selectPath(asset: Asset) {
    return {
      type: StoreActionsEnum.EXPLORER_SELECT_PATH,
      payload: { asset }
    };
  }

  static selectAsset(asset: Asset) {
    return {
      type: StoreActionsEnum.EXPLORER_SELECT_ASSET,
      payload: { asset }
    };
  }

}
