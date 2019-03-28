import { Injectable } from '@angular/core';
import { ProjectEpics } from './project.epics';
import { combineEpics, ofType, StateObservable } from 'redux-observable';
import { mergeMap, switchMap } from 'rxjs/operators';
import { isArray } from 'util';
import { InterceptorEpics } from './interceptor.epics';
import { AssetEpics } from './asset.epics';
import { UserEpics } from './user.epics';
import { GroupEpics } from './group.epics';
import { Observable } from 'rxjs';
import { Action } from 'redux';
import { AppState } from '../classes/app-state.interface';

@Injectable()
export class RootEpic {

  static createEpic(type, mapProject, useSwitchMap = true) {
    type = isArray(type) ? type : [type];
    return (action$: Observable<Action>, state$: StateObservable<AppState>, store, dependencies) => action$.pipe(
      ofType(...type),
      useSwitchMap
        ? switchMap((action) => mapProject(action, state$, dependencies, action$))
        : mergeMap((action) => mapProject(action, state$, dependencies, action$))
    );
  }

  constructor(private projectEpics: ProjectEpics,
              private interceptor: InterceptorEpics,
              private assetEpics: AssetEpics,
              private userEpics: UserEpics,
              private groupEpics: GroupEpics) {

  }

  epic() {
    return combineEpics(...[].concat(
      this.projectEpics.epics(),
      this.assetEpics.epics(),
      this.userEpics.epics(),
      this.groupEpics.epics(),
      this.interceptor.epics()
    ));
  }

}
