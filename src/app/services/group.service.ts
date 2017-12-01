import { Injectable } from '@angular/core';

import {environment} from '../../environments/environment';
import {Site} from '../models/site.model';
import {StudioHttpService} from './http.service';

const baseUrl = `${environment.apiUrl}/group`;

@Injectable()
export class GroupService {

  constructor(public http: StudioHttpService) { }

  allBySite(query?) {
    return this.http.get(`${baseUrl}/get-all.json`, query)
      .map((data) => ({
        total: '(not provided by API)',
        sites: data.sites.map((dataItem) => {
          return Site.fromJSON(dataItem);
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
