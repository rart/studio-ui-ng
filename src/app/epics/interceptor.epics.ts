import { Injectable } from '@angular/core';
import { Actions } from '../enums/actions.enum';
import { RootEpic } from './root.epic';
import { ActivatedRoute, Router } from '@angular/router';
import { BaseEpic } from './base-epic';
import { NEVER } from 'rxjs';

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
    (action, store) => {
      let router = this.router;
      if (!router.url.includes('/preview')) {
        const state = store.getState();
        router.navigate(
          router.url.includes('/project')
            ? [`/project/${state.activeProjectCode}/preview`]
            : ['/preview']
        );
      }
      return NEVER;
    });

  private editAsset = RootEpic.createEpic(
    Actions.EDIT_ASSET,
    () => {
      let router = this.router;
      if (!router.url.includes('/edit')) {
        router.navigate([`/edit`]);
      }
      return NEVER;
    });

}

// Could do something like below but don't really need to
// do anything with the router's navigation promise resolution
// return PromiseObservable
//   .create(router.navigate([`/preview`]))
//   .pipe(ignoreElements());
