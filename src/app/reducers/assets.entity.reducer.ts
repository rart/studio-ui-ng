import { AnyAction, Reducer } from 'redux';

import { StoreActionsEnum } from '../enums/actions.enum';
import { LookupTable, StateEntity } from '../classes/app-state.interface';
import { createEntityState, createLookupTable } from '../utils/state.utils';
import { Asset } from '../models/asset.model';
import { notNullOrUndefined } from '../app.utils';

export function flatten(array: Asset[]): Asset[] {
  let flat = [];
  array.forEach(asset => {
    let nextAsset = Asset.deserialize(asset);
    nextAsset.children ? (flat = flat.concat(nextAsset, ...flatten(<Asset[]>nextAsset.children))) : flat.push(nextAsset);
  });
  return flat;
}

export function normalize(model: Asset): Asset {
  if (notNullOrUndefined(model.children)) {
    let nextModel = Asset.deserialize(model);
    nextModel.children = null;
    // children ids already set by model class itself on childrenIds prop
    return nextModel;
  }
  return model;
}

export function denormalize(model: Asset, table: LookupTable<Asset>): Asset {
  if (notNullOrUndefined(model.children)) {
    let nextModel = Asset.deserialize(model);
    nextModel.children = model.childrenIds.map(child => table[child]);
    return nextModel;
  }
  return model;
}

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
          byId: createLookupTable<Asset>(flatten(action.payload).map(a => normalize(a)))
        });

      case StoreActionsEnum.SOME_ASSETS_FETCHED:
        return createEntityState({
          byId: {
            ...state.byId || {},
            ...createLookupTable<Asset>(flatten(action.payload).map(a => normalize(a)))
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
            ...createLookupTable<Asset>(flatten([action.payload]).map(a => normalize(a)))
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
