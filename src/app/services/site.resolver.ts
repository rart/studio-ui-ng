import {Injectable} from '@angular/core';
import {ActivatedRouteSnapshot, Resolve, RouterStateSnapshot} from '@angular/router';
import {SiteService} from './site.service';

@Injectable()
export class SiteResolver implements Resolve<any> {

  constructor(private siteService: SiteService) {
  }

  resolve(route: ActivatedRouteSnapshot,
          state: RouterStateSnapshot) {
    const site = route.params.site;
    return this.siteService.get(site).then((data) => {
      return data;
    });
  }

}
