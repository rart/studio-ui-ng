import { Injectable } from '@angular/core';
import { AnyAction, Store } from 'redux';
import { StoreActionsEnum } from '../enums/actions.enum';
import { Asset } from '../models/asset.model';
import { EditSession } from '../classes/app-state.interface';

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

  edit(projectCode: string, assetId: string): AnyAction {
    return {
      type: StoreActionsEnum.EDIT_ASSET,
      payload: { projectCode, assetId }
    };
  }

  editMany(assets: { projectCode: string, assetId: string }[]): AnyAction {
    return {
      type: StoreActionsEnum.EDIT_ASSETS,
      payload: assets
    };
  }

  closeEditSession(session, asset): AnyAction {
    return {
      type: StoreActionsEnum.CLOSE_EDIT_SESSION,
      payload: { session, asset }
    };
  }

  editSessionClosed(session) {
    return {
      type: StoreActionsEnum.EDIT_SESSION_CLOSED,
      payload: { session }
    };
  }

  setActiveSession(next) {
    return {
      type: StoreActionsEnum.CHANGE_ACTIVE_EDIT_SESSION,
      payload: { next }
    };
  }

  persistSessionChanges(asset: Asset, session: EditSession, content: string) {
    return {
      type: StoreActionsEnum.PERSIST_SESSION_CHANGES,
      payload: { asset, session, content }
    };
  }

  sessionChangesPersisted(session: EditSession) {
    return {
      type: StoreActionsEnum.SESSION_CHANGES_PERSISTED,
      payload: { session }
    };
  }

  updateEditSession(sessionId: string, data: any, hasChanges: boolean) {
    return {
      type: StoreActionsEnum.UPDATE_EDIT_SESSION,
      payload: { id: sessionId, data, hasChanges }
    };
  }

  fetchForEdit(sessionUUID: string, projectCode: string, assetId: string): AnyAction {
    return {
      type: StoreActionsEnum.FETCH_ASSET_FOR_EDIT,
      payload: { sessionUUID, projectCode, assetId }
    };
  }

  fetchedForEdit(sessionUUID: string, data: any): AnyAction {
    return {
      type: StoreActionsEnum.ASSET_FETCHED_FOR_EDIT,
      payload: { sessionUUID, data }
    };
  }

  get(assetId): AnyAction {
    return {
      type: StoreActionsEnum.FETCH_ASSET,
      payload: assetId
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
