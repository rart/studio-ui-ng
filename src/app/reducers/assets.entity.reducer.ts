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
        return {
          ...state,
          loading: { ...state.loading }
        };

      case StoreActionsEnum.ASSETS_FETCHED:
        return createEntityState({
          byId: createLookupTable<Asset>(action.payload)
        });

      case StoreActionsEnum.SOME_ASSETS_FETCHED:
        return createEntityState({
          byId: {
            ...state.byId || {},
            ...createLookupTable<Asset>(action.payload)
          }
        });

      case StoreActionsEnum.FETCH_ASSET:
        return {
          ...state,
          loading: { ...state.loading, [action.payload.id]: true }
        };

      case StoreActionsEnum.ASSET_FETCH_ERROR:
        return {
          ...state,
          error: { ...state.error, [action.payload.id]: true },
          loading: { ...state.loading, [action.payload.id]: false }
        };

      case StoreActionsEnum.ASSET_FETCHED:
        return {
          ...state,
          error: { ...state.error, [action.payload.id]: false },
          loading: { ...state.loading, [action.payload.id]: false },
          byId: {
            ...state.byId,
            [action.payload.id]: action.payload
          }
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
