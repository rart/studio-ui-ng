import { map } from 'rxjs/operators';
import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';

import { Project } from '../models/project.model';
import { StudioHttpService } from './http.service';
import { Observable } from 'rxjs/Observable';
import { EntityService } from '../classes/entity-service.interface';
import { PagedResponse } from '../classes/paged-response.interface';
import { PostResponse } from '../classes/post-response.interface';
import { API1Parser } from '../classes/api1-parser.class';

const baseUrl = `${environment.apiUrl}/site`;

@Injectable()
export class ProjectService implements EntityService<Project> {

  constructor(private http: StudioHttpService) {

  }

  all(query?): Observable<Project[]> {
    return this.http.get(`${baseUrl}/get-per-user.json`, Object.assign({ username: 'admin' }, query || {}))
      .pipe(map((data) => {
        return data.sites.map((item) => API1Parser.project(item));
      }));
  }

  page(query?): Observable<PagedResponse<Project>> {
    return this.http.get(`${baseUrl}/get-per-user.json`, Object.assign({ username: 'admin' }, query || {}))
      .pipe(map((data) => ({
        total: data.total,
        entries: data.sites.map((item) => API1Parser.project(item))
      })));
  }

  allBlueprints() {
    return this.http.get(`${baseUrl}/get-available-blueprints.json`);
  }

  byId(sideCode): Observable<Project> {
    return this.http.get(`${baseUrl}/get.json`, { site_id: sideCode })
      .pipe(map((data) => API1Parser.project(data)));
  }

  by(entityProperty: string, value): Observable<Project> {
    return undefined;
  }

  create(project: Project): Observable<PostResponse<Project>> {
    return this.http
      .post(`${baseUrl}/create.json`, {
        site_id: project.code,
        description: project.description,
        blueprint: project.blueprint.id
      })
      .pipe(map(StudioHttpService.mapToPostResponse(project)));
  }

  update(project: Project): Observable<PostResponse<Project>> {
    return this.http
      .post(`${baseUrl}/update.json`, {
        site_id: project.code,
        description: project.description,
        blueprint: project.blueprint.id
      })
      .pipe(map(StudioHttpService.mapToPostResponse(project)));
  }

  delete(project: Project): Observable<PostResponse<Project>> {
    return this.http
      .post(`${baseUrl}/delete-site.json`, { siteId: project.code })
      .pipe(map(StudioHttpService.mapToPostResponse(project)));
  }

}
