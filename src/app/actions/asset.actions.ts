import { Injectable } from '@angular/core';
import { AnyAction, Store } from 'redux';
import { Actions } from '../enums/actions.enum';
import { Asset } from '../models/asset.model';
import { EditSession } from '../classes/app-state.interface';

@Injectable()
export class AssetActions {

  fetch(query?): AnyAction {
    return {
      type: Actions.FETCH_ASSETS,
      query
    };
  }

  fetchMany(query): AnyAction {
    return {
      type: Actions.FETCH_SOME_ASSETS,
      payload: query
    };
  }

  fetched(assets): AnyAction {
    return {
      type: Actions.ASSETS_FETCHED,
      payload: assets
    };
  }

  fetchedMany(assets: Asset[]): AnyAction {
    return {
      type: Actions.SOME_ASSETS_FETCHED,
      payload: assets
    };
  }

  edit(projectCode: string, assetId: string): AnyAction {
    return {
      type: Actions.EDIT_ASSET,
      payload: { projectCode, assetId }
    };
  }

  editMany(assets: { projectCode: string, assetId: string }[]): AnyAction {
    return {
      type: Actions.EDIT_ASSETS,
      payload: assets
    };
  }

  closeEditSession(session, asset): AnyAction {
    return {
      type: Actions.CLOSE_EDIT_SESSION,
      payload: { session, asset }
    };
  }

  editSessionClosed(session) {
    return {
      type: Actions.EDIT_SESSION_CLOSED,
      payload: { session }
    };
  }

  setActiveSession(next) {
    return {
      type: Actions.CHANGE_ACTIVE_EDIT_SESSION,
      payload: { next }
    };
  }

  persistSessionChanges(asset: Asset, session: EditSession, content: string) {
    return {
      type: Actions.PERSIST_SESSION_CHANGES,
      payload: { asset, session, content }
    };
  }

  sessionChangesPersisted(session: EditSession) {
    return {
      type: Actions.SESSION_CHANGES_PERSISTED,
      payload: { session }
    };
  }

  updateEditSession(sessionId: string, data: any, hasChanges: boolean) {
    return {
      type: Actions.UPDATE_EDIT_SESSION,
      payload: { id: sessionId, data, hasChanges }
    };
  }

  fetchForEdit(sessionUUID: string, projectCode: string, assetId: string): AnyAction {
    return {
      type: Actions.FETCH_ASSET_FOR_EDIT,
      payload: { sessionUUID, projectCode, assetId }
    };
  }

  fetchedForEdit(sessionUUID: string, data: any): AnyAction {
    return {
      type: Actions.ASSET_FETCHED_FOR_EDIT,
      payload: { sessionUUID, data }
    };
  }

  get(id: string): AnyAction {
    return {
      type: Actions.FETCH_ASSET,
      payload: { id }
    };
  }

  getError(id: string): AnyAction {
    return {
      type: Actions.ASSET_FETCH_ERROR,
      payload: { id }
    };
  }

  gotten(asset: Asset): AnyAction {
    return {
      type: Actions.ASSET_FETCHED,
      payload: asset
    };
  }

  create(asset: Asset): AnyAction {
    return {
      type: Actions.CREATE_ASSET,
      payload: asset
    };
  }

  created(asset: Asset): AnyAction {
    return {
      type: Actions.ASSET_CREATED,
      payload: asset
    };
  }

  update(asset: Asset): AnyAction {
    return {
      type: Actions.UPDATE_ASSET,
      payload: asset
    };
  }

  updated(asset: Asset): AnyAction {
    return {
      type: Actions.ASSET_UPDATED,
      payload: asset
    };
  }

  delete(asset: Asset): AnyAction {
    return {
      type: Actions.DELETE_ASSET,
      payload: asset
    };
  }

  deleted(asset: Asset): AnyAction {
    return {
      type: Actions.ASSET_DELETED,
      payload: asset
    };
  }

}
