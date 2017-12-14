import { AnyAction, Reducer } from 'redux';

import { StoreActionsEnum } from '../enums/actions.enum';
import { StateEntity } from '../classes/app-state.interface';
import { createEntityState, createLookupTable } from '../utils/state.utils';
import { Asset } from '../models/asset.model';
import { isArray } from 'util';

export const assets: Reducer<StateEntity<Asset>> =
  (state = createEntityState<Asset>({}), action: AnyAction): StateEntity<Asset> => {
    switch (action.type) {

      case StoreActionsEnum.FETCH_ASSETS:
        return createEntityState({
          loading: true,
          byId: state.byId
        });

      case StoreActionsEnum.ASSETS_FETCHED:
        return createEntityState({
          byId: createLookupTable<Asset>(action.payload)
        });

      case StoreActionsEnum.SOME_ASSETS_FETCHED:
        return createEntityState({
          byId: {
            ...state.byId || {},
            ...createLookupTable(action.payload)
          }
        });

      case StoreActionsEnum.FETCH_ASSET:
        return state;

      case StoreActionsEnum.ASSET_FETCHED:
        return createEntityState({
          byId: {
            ...state.byId,
            [action.payload.id]: action.payload
          }
        });

      case StoreActionsEnum.PROJECTS_FETCH_ERROR:
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
