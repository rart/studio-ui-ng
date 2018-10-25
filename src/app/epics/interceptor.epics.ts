import { Injectable } from '@angular/core';
import { Actions } from '../enums/actions.enum';
import { RootEpic } from './root.epic';
import { ActivatedRoute, Router } from '@angular/router';
import { PreviewTabCore } from '../classes/app-state.interface';
import { BaseEpic } from './base-epic';
import { never } from 'rxjs/observable/never';

@Injectable()
export class InterceptorEpics extends BaseEpic {

  protected manifest: string[] = [
    'navigation',
    'editAsset'
  ];

  constructor(private router: Router,
              private route: ActivatedRoute) {
    super();
  }

  private navigation = RootEpic.createEpic(
    [
      Actions.NAVIGATE_ON_ACTIVE,
      Actions.OPEN_TAB,
      Actions.OPEN_TABS
    ],
    (tab: PreviewTabCore) => {
      let router = this.router;
      if (!router.url.includes('/preview')) {
        router.navigate([`/preview`]);
      }
      return never();
    });

  private editAsset = RootEpic.createEpic(
    Actions.EDIT_ASSET,
    () => {
      let router = this.router;
      if (!router.url.includes('/edit')) {
        router.navigate([`/edit`]);
      }
      return never();
    });

}

// Could do something like below but don't really need to
// do anything with the router's navigation promise resolution
// return PromiseObservable
//   .create(router.navigate([`/preview`]))
//   .pipe(ignoreElements());
