import {Injectable} from '@angular/core';
import {ActivatedRouteSnapshot, Resolve, RouterStateSnapshot} from '@angular/router';
import {SiteService} from './site.service';

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
