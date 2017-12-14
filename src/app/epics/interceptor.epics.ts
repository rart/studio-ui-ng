import { Injectable } from '@angular/core';
import { ignoreElements, switchMap } from 'rxjs/operators';
import { StoreActionsEnum } from '../enums/actions.enum';
import { RootEpic } from './root.epic';
import { ActivatedRoute, Router } from '@angular/router';
import { PreviewTabCore } from '../classes/app-state.interface';
import { PromiseObservable } from 'rxjs/observable/PromiseObservable';
import { EmptyObservable } from 'rxjs/observable/EmptyObservable';
import { Asset } from '../models/asset.model';

@Injectable()
export class InterceptorEpics {

  constructor(private router: Router,
              private route: ActivatedRoute) {

  }

  private navigation = RootEpic.createEpic(
    StoreActionsEnum.NAVIGATE_ON_ACTIVE,
    (tab: PreviewTabCore) => {
      let router = this.router;
      if (!router.url.includes('/preview')) {
        router.navigate([`/preview`]);
      }
      return EmptyObservable
        .create()
        .pipe(ignoreElements());
    });

  private editAsset(action$, store, dependencies) {
    return action$.ofType(StoreActionsEnum.EDIT_ASSET).pipe(
      switchMap((asset: Asset) => {
        let router = this.router;
        if (!router.url.includes('/editor')) {
          router.navigate([`/editor`]);
        }
        return EmptyObservable
          .create()
          .pipe(ignoreElements());
      })
    );
  }

  epics() {
    return [
      (action$, store, dependencies) => this.navigation(action$, store, dependencies),
      (action$, store, dependencies) => this.editAsset(action$, store, dependencies)
    ];
  }

}

// Could do something like below but don't really need to
// do anything with the router's navigation promise resolution
// return PromiseObservable
//   .create(router.navigate([`/preview`]))
//   .pipe(ignoreElements());
