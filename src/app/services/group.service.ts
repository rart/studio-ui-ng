import { Injectable } from '@angular/core';

import { environment } from '../../environments/environment';
import { Project } from '../models/project.model';
import { StudioHttpService } from './http.service';
import { parseEntity } from '../utils/api.utils';

const baseUrl = `${environment.apiUrl}/group`;

@Injectable()
export class GroupService {

  constructor(public http: StudioHttpService) {
  }

  byProject(query?) {
    return this.http.get(`${baseUrl}/get-all.json`, query)
      .map((data) => ({
        total: '(not provided by API)',
        projects: data.projects.map((dataItem) => {
          return parseEntity(Project, dataItem);
        })
      }));
  }

  addUser(data) {
    return this.http
      .post(`${baseUrl}/add-user.json`, {
        username: data.username,
        site_id: data.siteCode,
        group_name: data.groupName
      });
  }

  removeUser(data) {
    return this.http
      .post(`${baseUrl}/remove-user.json`, {
        username: data.username,
        site_id: data.siteCode,
        group_name: data.groupName
      });
  }

}
