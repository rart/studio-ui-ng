import { AnyAction, Reducer } from 'redux';

import { StoreActionsEnum } from '../enums/actions.enum';
import { StateEntity } from '../classes/app-state.interface';
import { createEntityState, createLookupTable } from '../utils/state.utils';
import { Asset } from '../models/asset.model';
import { isNullOrUndefined } from 'util';

export const asset: Reducer<StateEntity<Asset>> =
  (state = createEntityState({}), action: AnyAction): StateEntity<Asset> => {
    switch (action.type) {

      case StoreActionsEnum.FETCH_ASSETS:
        return createEntityState({
          loading: true,
          byId: state.byId,
          list: state.list
        });

      case StoreActionsEnum.ASSETS_FETCHED:
        return createEntityState({
          byId: createLookupTable(action.assets),
          list: action.assets
        });

      case StoreActionsEnum.SOME_ASSETS_FETCHED:
        let newIds = action.assets.map(_asset => _asset.id);
        return createEntityState({
          byId: {
            ...state.byId || {},
            ...createLookupTable(action.assets)
          },
          list: (state.list || []).filter(_asset => !newIds.includes(_asset.id)).concat(action.assets)
        });

      case StoreActionsEnum.FETCH_ASSET:
        return state;

      case StoreActionsEnum.ASSET_FETCHED:
        return createEntityState({
          list: (
            !isNullOrUndefined(state.byId) && !isNullOrUndefined(state.byId[action.asset.id])
              ? (state.list || []).filter(_asset => _asset.id !== action.asset)
              : (state.list || [])
          ).concat([action.asset]),
          byId: {
            ...state.byId,
            [action.asset.id]: action.asset
          }
        });

      case StoreActionsEnum.SITES_FETCH_ERROR:
        return {
          ...state,
          error: new Error('')
        };

      case StoreActionsEnum.CREATE_ASSET:
        return state;

      case StoreActionsEnum.UPDATE_ASSET:
        return state;

      case StoreActionsEnum.DELETE_ASSET:
        return state;

      case StoreActionsEnum.ASSET_CREATED:
        return state;

      case StoreActionsEnum.ASSET_UPDATED:
        return state;

      case StoreActionsEnum.ASSET_DELETED:
        return state;

      default:
        return state;

    }
  };
