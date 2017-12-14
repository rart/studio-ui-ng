import { Injectable } from '@angular/core';
import { map, mergeMap, switchMap, take } from 'rxjs/operators';
import { StoreActionsEnum } from '../enums/actions.enum';
import { WorkflowService } from '../services/workflow.service';
import { AssetActions } from '../actions/asset.actions';

@Injectable()
export class AssetEpics {

  constructor(private workflow: WorkflowService,
              private assetActions: AssetActions) {

  }

  // private some = RootEpic.createEpic(
  //   StoreActionsEnum.FETCH_SOME_ASSETS,
  //   (action) => {
  //     return this.workflow.fetch(action.payload)
  //       .pipe(map((data: any) => this.assetActions.fetchedSome(data.entries, action.spaceUID)));
  //   });

  some(action$, store, dependencies) {
    return action$.ofType(StoreActionsEnum.FETCH_SOME_ASSETS).pipe(
      mergeMap((action: any) => {
        return this.workflow.fetch(action.payload)
          .pipe(map((data: any) => this.assetActions.fetchedSome(data)));
      })
    );
  }

  epics() {
    return [
      // (action$, store, dependencies) => this.some(action$, store, dependencies)
    ];
  }

}
