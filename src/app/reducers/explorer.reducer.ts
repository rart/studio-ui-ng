import { AnyAction, Reducer } from 'redux';
import { StoreActionsEnum } from '../enums/actions.enum';
import { ExplorerState } from '../classes/app-state.interface';
import { Project } from '../models/project.model';
import { Asset } from '../models/asset.model';
import { notNullOrUndefined } from '../app.utils';
import { AssetTypeEnum } from '../enums/asset-type.enum';

export const explorer: Reducer<ExplorerState> = (state = {
  activeProjectCode: null,
  byProject: {}
}, action: AnyAction) => {
  switch (action.type) {

    case StoreActionsEnum.EXPLORER_SELECT_PROJECT: {
      let code = action.payload.projectCode;
      let container = state.byProject[code] || {};
      return {
        activeProjectCode: code,
        byProject: {
          ...state.byProject,
          [code]: {
            asset: notNullOrUndefined(container.asset) ? container.asset : null,
            paths: ((notNullOrUndefined(container) && notNullOrUndefined(container.paths))
              ? container.paths
              : [`${code}:${action.payload.root}`])
          }
        }
      };
    }

    case StoreActionsEnum.EXPLORER_SELECT_PATH:
    case StoreActionsEnum.EXPLORER_SELECT_ASSET: {

      let asset: Asset = action.payload.asset;
      let code = state.activeProjectCode;
      let container = state.byProject[code] || {};
      if (asset.type !== AssetTypeEnum.FOLDER) {
        return {
          ...state,
          byProject: {
            ...state.byProject,
            [code]: {
              ...container,
              asset: asset.id
            }
          }
        };
      }

      let paths = container.paths;
      let id = asset.id;
      let parent = id.substr(0, id.lastIndexOf('/'));

      if (parent === `${asset.projectCode}:`) {
        parent = `${asset.projectCode}:/`;
      }

      let index = paths.findIndex((path) => path === parent);
      paths = paths.slice(0, (index + 1)).concat(id);

      return {
        ...state,
        byProject: {
          ...state.byProject,
          [code]: {
            ...container,
            paths: paths,
            asset: null
          }
        }
      };

    }

    default:
      return state;

  }
};
