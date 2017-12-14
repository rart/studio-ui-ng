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

  fetchSome(query): AnyAction {
    return {
      type: StoreActionsEnum.FETCH_SOME_ASSETS,
      payload: query
    };
  }

  fetched(assets): AnyAction {
    return {
      type: StoreActionsEnum.ASSETS_FETCHED,
      payload: assets
    };
  }

  fetchedSome(assets: Asset[]): AnyAction {
    return {
      type: StoreActionsEnum.SOME_ASSETS_FETCHED,
      payload: assets
    };
  }

  get(uniqueId): AnyAction {
    return {
      type: StoreActionsEnum.ASSET_FETCHED,
      payload: uniqueId
    };
  }

  gotten(asset: Asset): AnyAction {
    return {
      type: StoreActionsEnum.ASSET_FETCHED,
      payload: asset
    };
  }

  create(asset: Asset): AnyAction {
    return {
      type: StoreActionsEnum.CREATE_ASSET,
      payload: asset
    };
  }

  created(asset: Asset): AnyAction {
    return {
      type: StoreActionsEnum.ASSET_CREATED,
      payload: asset
    };
  }

  update(asset: Asset): AnyAction {
    return {
      type: StoreActionsEnum.UPDATE_ASSET,
      payload: asset
    };
  }

  updated(asset: Asset): AnyAction {
    return {
      type: StoreActionsEnum.ASSET_UPDATED,
      payload: asset
    };
  }

  delete(asset: Asset): AnyAction {
    return {
      type: StoreActionsEnum.DELETE_ASSET,
      payload: asset
    };
  }

  deleted(asset: Asset): AnyAction {
    return {
      type: StoreActionsEnum.ASSET_DELETED,
      payload: asset
    };
  }

}
