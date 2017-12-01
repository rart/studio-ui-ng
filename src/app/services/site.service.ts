import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';

import { Site } from '../models/site.model';
import { StudioHttpService } from './http.service';
import { Observable } from 'rxjs/Observable';
import { EntityService } from '../classes/entity-service.interface';
import { PagedResponse } from '../classes/paged-response.interface';
import { PostResponse } from '../classes/post-response.interface';

const baseUrl = `${environment.apiUrl}/site`;

@Injectable()
export class SiteService implements EntityService<Site> {

  constructor(public http: StudioHttpService) {
  }

  all(query?): Observable<PagedResponse<Site>> {
    return this.http.get(`${baseUrl}/get-per-user.json`, Object.assign({ username: 'admin' }, query || {}))
      .map((data) => ({
        total: data.total,
        entries: data.sites.map((item) => Site.fromJSON(item))
      }));
  }

  allBlueprints() {
    return this.http.get(`${baseUrl}/get-available-blueprints.json`);
  }

  byId(sideCode): Observable<Site> {
    return this.http.get(`${baseUrl}/get.json`, { site_id: sideCode })
      .map((data) => Site.fromJSON(data));
  }

  by(entityProperty: string, value): Observable<Site> {
    return undefined;
  }

  create(site: Site): Observable<PostResponse<Site>> {
    return this.http
      .post(`${baseUrl}/create.json`, {
        site_id: site.code,
        description: site.description,
        blueprint: site.blueprint.id
      })
      .map(StudioHttpService.mapToPostResponse(site));
  }

  update(site: Site): Observable<PostResponse<Site>> {
    return this.http
      .post(`${baseUrl}/update.json`, {
        site_id: site.code,
        description: site.description,
        blueprint: site.blueprint.id
      })
      .map(StudioHttpService.mapToPostResponse(site));
  }

  delete(site: Site): Observable<PostResponse<Site>> {
    return this.http
      .post(`${baseUrl}/delete-site.json`, { siteId: site.code })
      .map(StudioHttpService.mapToPostResponse(site));
  }

}
