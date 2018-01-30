import { Injectable } from '@angular/core';
import { map, catchError, switchMap } from 'rxjs/operators';
import { StoreActionsEnum } from '../enums/actions.enum';
import { WorkflowService } from '../services/workflow.service';
import { AssetActions } from '../actions/asset.actions';
import { RootEpic } from './root.epic';
import { ContentService } from '../services/content.service';
import { forkJoin } from 'rxjs/observable/forkJoin';
import { Asset } from '../models/asset.model';
import { isArray } from 'util';
import { BaseEpic } from './base-epic';
import { of } from 'rxjs/observable/of';

@Injectable()
export class AssetEpics extends BaseEpic {

  protected manifest = [
    'get',
    'some',
    'recallForEdit',
    'closeEditSession',
    'persistSessionChanges'
  ];

  constructor(private workflow: WorkflowService,
              private content: ContentService,
              private actions: AssetActions) {
    super();
  }

  private get = RootEpic.createEpic(
    StoreActionsEnum.FETCH_ASSET,
    ({ payload }) => {
      return this.content
        .byId(payload.id)
        .pipe(
          map(this.actions.gotten),
          catchError((error, caught) => of(this.actions.getError(payload.id)))
        );
    }, false);

  private recallForEdit = RootEpic.createEpic(
    StoreActionsEnum.FETCH_ASSET_FOR_EDIT,
    ({ payload }) => {
      let { assetId, sessionUUID } = payload;
      return forkJoin([
          this.content.read(assetId, true),
          this.content.byId(assetId)
        ])
        .pipe(
          switchMap((responses: any[]) => {
            let asset: Asset = responses[1];
            let { content } = responses[0];
            return [
              this.actions.gotten(asset),
              this.actions.fetchedForEdit(sessionUUID, content)
            ];
          })
        );
    });

  private closeEditSession = RootEpic.createEpic(
    StoreActionsEnum.CLOSE_EDIT_SESSION,
    ({ payload }) => {
      if (payload.content) {
        return this.content
          .write(payload.asset, payload.content, true)
          .pipe(map(_ => this.actions.editSessionClosed(payload.session)));
      } else {
        return this.content
          .unlock(payload.asset)
          .pipe(switchMap(asset => [
            this.actions.editSessionClosed(payload.session),
            this.actions.gotten(asset)
          ]));
      }
    });

  private some = RootEpic.createEpic(
    StoreActionsEnum.FETCH_SOME_ASSETS,
    ({ payload }) => {
      if (isArray(payload)) {
        return forkJoin(payload.map(obj => this.content.byId(obj.assetId)))
          .pipe(map((results: Asset[]) => this.actions.fetchedMany(<Asset[]>results)));
      }
    });

  private persistSessionChanges = RootEpic.createEpic(
    StoreActionsEnum.PERSIST_SESSION_CHANGES,
    ({ payload }) => {
      return this.content
        .write(payload.asset, payload.content)
        .pipe(
          switchMap((asset) => [
            this.actions.gotten(asset),
            this.actions.sessionChangesPersisted({ ...payload.session, fetchPayload: payload.content })
          ])
        );
    });

}
