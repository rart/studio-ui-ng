import {Injectable} from '@angular/core';
import {ActivatedRouteSnapshot, Resolve, RouterStateSnapshot} from '@angular/router';
import {SiteService} from './site.service';
import { tap } from 'rxjs/operators';
import { AppState } from '../classes/app-state.interface';
import { NgRedux } from '@angular-redux/store';
import { SiteActions } from '../actions/site.actions';

@Injectable()
export class SitesResolver implements Resolve<any> {

  constructor(private siteService: SiteService,
              private siteActions: SiteActions,
              private store: NgRedux<AppState>) {

  }

  resolve(route: ActivatedRouteSnapshot,
          state: RouterStateSnapshot) {
    return this.siteService
      .all()
      .pipe(tap(sites => this.store.dispatch(this.siteActions.fetched(sites))));
  }

}
