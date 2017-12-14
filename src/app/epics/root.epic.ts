import { Injectable } from '@angular/core';
import { ProjectEpics } from './project.epics';
import { combineEpics } from 'redux-observable';
import { switchMap } from 'rxjs/operators';
import { isArray } from 'util';
import { InterceptorEpics } from './interceptor.epics';
import { AssetEpics } from './asset.epics';

@Injectable()
export class RootEpic {

  static createEpic(type, switchMapProj) {
    type = isArray(type) ? type : [type];
    return (action$, store, dependencies) => {
      return action$.ofType(...type).pipe(
        switchMap(switchMapProj)
      );
    };
  }

  constructor(private projectEpics: ProjectEpics,
              private interceptor: InterceptorEpics,
              private assetEpics: AssetEpics) {

  }

  epic() {
    return combineEpics(...[
      ...this.projectEpics.epics(),
      ...this.interceptor.epics(),
      ...this.assetEpics.epics()
    ]);
  }

}
