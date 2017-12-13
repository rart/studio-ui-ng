import { Injectable } from '@angular/core';
import { SiteEpics } from './site.epic';
import { combineEpics } from 'redux-observable';
import { switchMap } from 'rxjs/operators';
import { isArray } from 'util';
import { InterceptorEpic } from './interceptor.epic';

@Injectable()
export class RootEpic {

  static createEpic(type, switchMapProj) {
    type = isArray(type) ? type : [type];
    return (action$) => {
      return action$.ofType(...type).pipe(
        switchMap(switchMapProj)
      );
    };
  }

  constructor(private siteEpic: SiteEpics,
              private interceptor: InterceptorEpic) {

  }

  epic() {
    return combineEpics(...[
      ...this.siteEpic.epics(),
      ...this.interceptor.epics()
    ]);
  }

}
