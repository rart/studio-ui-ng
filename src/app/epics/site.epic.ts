import { Injectable } from '@angular/core';
import { map } from 'rxjs/operators';
import { SiteService } from '../services/site.service';
import { SiteActions } from '../actions/site.actions';
import { StoreActionsEnum } from '../enums/actions.enum';
import { Site } from '../models/site.model';
import { RootEpic } from './root.epic';

@Injectable()
export class SiteEpics {

  constructor(private siteService: SiteService,
              private siteActions: SiteActions) {

  }

  private edit = RootEpic.createEpic(
    StoreActionsEnum.EDIT_SITE,
    (query?) => {
      return this.siteService.all().pipe(
        map(this.siteActions.fetched)
      );
    });

  private all = RootEpic.createEpic(
    StoreActionsEnum.FETCH_SITES,
    (query?) => {
      return this.siteService
        .all()
        .pipe(
          map(this.siteActions.fetched)
        );
    });

  private create = RootEpic.createEpic(
    StoreActionsEnum.CREATE_SITE,
    (site: Site) => {
      return this.siteService
        .create(site)
        .pipe(
          map(postResponse => this.siteActions.created(postResponse.entity))
        );
    });

  private update = RootEpic.createEpic(
    StoreActionsEnum.UPDATE_SITE,
    (site: Site) => {
      return this.siteService
        .update(site)
        .pipe(
          map(postResponse => this.siteActions.updated(postResponse.entity))
        );
    });

  private delete = RootEpic.createEpic(
    StoreActionsEnum.DELETE_SITE,
    (site: Site) => {
      return this.siteService
        .delete(site)
        .pipe(
          map(postResponse => this.siteActions.deleted(postResponse.entity))
        );
    });

  epics() {
    return [
      (action$) => this.all(action$),
      (action$) => this.create(action$),
      (action$) => this.update(action$),
      (action$) => this.delete(action$)
    ];
  }

  // private select = RootEpic.createEpic(
  //   StoreActionsEnum.SELECT_SITE,
  //   (site: Site) => {
  //
  //   });

  // private all(action$) {
  //   console.log(action$);
  //   return action$.ofType(StoreActionsEnum.FETCH_SITES).pipe(
  //     switchMap(value => {
  //       return this.siteService.all().pipe(
  //         map(this.siteActions.fetched)
  //       );
  //     })
  //   );
  // }

  // private create(action$) {
  //   return action$.ofType(StoreActionsEnum.CREATE_SITE).pipe(
  //     switchMap((site: Site) => {
  //       return this.siteService.create(site).pipe(
  //         map(postResponse => this.siteActions.created(postResponse.entity))
  //       );
  //     })
  //   );
  // }

  // private update(action$) {
  //   return action$.ofType(StoreActionsEnum.UPDATE_SITE).pipe(
  //     switchMap((site: Site) => {
  //       return this.siteService.update(site).pipe(
  //         map(postResponse => this.siteActions.created(postResponse.entity))
  //       );
  //     })
  //   );
  // }

  // private delete(action$) {
  //   return action$.ofType(StoreActionsEnum.DELETE_SITE).pipe(
  //     switchMap((site: Site) => {
  //       return this.siteService.delete(site).pipe(
  //         map(postResponse => this.siteActions.deleted(postResponse.entity))
  //       );
  //     })
  //   );
  // }

}
