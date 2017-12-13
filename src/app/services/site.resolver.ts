import {Injectable} from '@angular/core';
import {ActivatedRouteSnapshot, Resolve, RouterStateSnapshot} from '@angular/router';
import {SiteService} from './site.service';
import { AppState } from '../classes/app-state.interface';
import { NgRedux } from '@angular-redux/store';
import { tap } from 'rxjs/operators';
import { SiteActions } from '../actions/site.actions';

@Injectable()
export class SiteResolver implements Resolve<any> {

  constructor(private siteService: SiteService) {

  }

  resolve(route: ActivatedRouteSnapshot,
          state: RouterStateSnapshot) {
    const siteCode = route.params.site;
    return this.siteService.byId(siteCode);
  }

}
