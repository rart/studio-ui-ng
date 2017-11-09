import {Injectable} from '@angular/core';
import {environment} from '../../environments/environment';

import {Site} from '../models/site.model';
import {IEntityService, IPagedResponse, IPostResponse, StudioHttpService} from './http.service';

const baseUrl = `${environment.baseUrl}/site`;

@Injectable()
export class SiteService implements IEntityService<Site> {

  constructor(public http: StudioHttpService) {}

  all(query?): Promise<IPagedResponse<Site>> {
    return this.http.get(`${baseUrl}/get-per-user.json`, {username: 'admin'})
      .map((data) => ({
        total: data.total,
        entries: data.sites.map((item) => Site.fromJSON(item))
      }))
      .toPromise();
  }

  allBlueprints() {
    return this.http.get(`${baseUrl}/get-available-blueprints.json`)
      .toPromise();
  }

  get(sideCode): Promise<Site> {
    return this.http.get(`${baseUrl}/get.json`, {site_id: sideCode})
      .map((data) => Site.fromJSON(data))
      .toPromise();
  }

  create(entity: Site): Promise<IPostResponse<Site>> {
    throw new Error('Method not implemented.');
  }

  update(entity: Site): Promise<IPostResponse<Site>> {
    throw new Error('Method not implemented.');
  }

  delete(entity: Site): Promise<IPostResponse<Site>> {
    throw new Error('Method not implemented.');
  }

}
