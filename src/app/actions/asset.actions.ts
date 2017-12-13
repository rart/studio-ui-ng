import { Injectable } from '@angular/core';
import { AnyAction } from 'redux';
import { StoreActionsEnum } from '../enums/actions.enum';
import { Asset } from '../models/asset.model';

@Injectable()
export class AssetActions {

  fetch(query?): AnyAction {
    return {
      type: StoreActionsEnum.FETCH_ASSETS,
      query
    };
  }

  fetched(assets): AnyAction {
    return {
      type: StoreActionsEnum.ASSETS_FETCHED,
      assets
    };
  }

  fetchedSome(assets: Asset[]): AnyAction {
    return {
      type: StoreActionsEnum.SOME_ASSETS_FETCHED,
      assets
    };
  }

  get(uniqueId): AnyAction {
    return {
      type: StoreActionsEnum.ASSET_FETCHED,
      uniqueId
    };
  }

  gotten(asset: Asset): AnyAction {
    return {
      type: StoreActionsEnum.ASSET_FETCHED,
      asset
    };
  }

  create(asset: Asset): AnyAction {
    return {
      type: StoreActionsEnum.CREATE_ASSET,
      asset
    };
  }

  created(asset: Asset): AnyAction {
    return {
      type: StoreActionsEnum.ASSET_CREATED,
      asset
    };
  }

  update(asset: Asset): AnyAction {
    return {
      type: StoreActionsEnum.UPDATE_ASSET,
      asset
    };
  }

  updated(asset: Asset): AnyAction {
    return {
      type: StoreActionsEnum.ASSET_UPDATED,
      asset
    };
  }

  delete(asset: Asset): AnyAction {
    return {
      type: StoreActionsEnum.DELETE_ASSET,
      asset
    };
  }

  deleted(asset: Asset): AnyAction {
    return {
      type: StoreActionsEnum.ASSET_DELETED,
      asset
    };
  }

}
