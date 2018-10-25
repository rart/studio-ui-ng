import { Injectable } from '@angular/core';
import { ProjectEpics } from './project.epics';
import { combineEpics, ofType } from 'redux-observable';
import { mergeMap, switchMap } from 'rxjs/operators';
import { isArray } from 'util';
import { InterceptorEpics } from './interceptor.epics';
import { AssetEpics } from './asset.epics';
import { UserEpics } from './user.epics';
import { GroupEpics } from './group.epics';

@Injectable()
export class RootEpic {

  static createEpic(type, mapProject, useSwitchMap = true) {
    type = isArray(type) ? type : [type];
    return (action$, store, dependencies) => {
      return action$.pipe(
        ofType(...type),
        useSwitchMap ? switchMap(mapProject) : mergeMap(mapProject)
      );
    };
  }

  constructor(private projectEpics: ProjectEpics,
              private interceptor: InterceptorEpics,
              private assetEpics: AssetEpics,
              private userEpics: UserEpics,
              private groupEpics: GroupEpics) {

  }

  epic() {
    return combineEpics(...[
      ...this.projectEpics.epics(),
      ...this.assetEpics.epics(),
      ...this.userEpics.epics(),
      ...this.groupEpics.epics(),
      ...this.interceptor.epics()
    ]);
  }

}
