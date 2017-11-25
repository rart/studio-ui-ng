import {Injectable} from '@angular/core';
import {environment} from '../../environments/environment';

import {Site} from '../models/site.model';
import {IEntityService, IPagedResponse, IPostResponse, mapToPostResponse, StudioHttpService} from './http.service';

const baseUrl = `${environment.apiUrl}/site`;

@Injectable()
export class SiteService implements IEntityService<Site> {

  constructor(public http: StudioHttpService) {}

  all(query?): Promise<IPagedResponse<Site>> {
    return this.http.get(`${baseUrl}/get-per-user.json`, Object.assign({username: 'admin'}, query || {}))
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

  create(site: Site): Promise<IPostResponse<Site>> {
    return this.http
      .post(`${baseUrl}/create.json`, {
        site_id: site.code,
        description: site.description,
        blueprint: site.blueprint.id
      })
      .map(mapToPostResponse(site))
      .toPromise();
  }

  update(site: Site): Promise<IPostResponse<Site>> {
    return this.http
      .post(`${baseUrl}/update.json`, {
        site_id: site.code,
        description: site.description,
        blueprint: site.blueprint.id
      })
      .map(mapToPostResponse(site))
      .toPromise();
  }

  delete(site: Site): Promise<IPostResponse<Site>> {
    return this.http
      .post(`${baseUrl}/delete-site.json`, {siteId: site.code})
      .map(mapToPostResponse(site))
      .toPromise();
  }

}
