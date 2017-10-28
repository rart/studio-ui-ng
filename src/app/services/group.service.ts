import { Injectable } from '@angular/core';
import {Http} from '@angular/http';

import {environment} from '../../environments/environment';
import {fetchObservable, fetchPromise} from '../app.utils';
import {Site} from '../models/site';
import {Group} from '../models/group';

const baseUrl = `${environment.baseUrl}/group`;

@Injectable()
export class GroupService {

  constructor(public http: Http) { }

  all(query?) {
    console.error('Not implemented.');
  }

  allBySite(query?) {
    return fetchObservable(this.http, `${baseUrl}/get-all.json`, query)
      .map((data) => ({
        total: '(not provided by API)',
        sites: data.sites.map((dataItem) => {
          return Site.fromJSON(dataItem);
        })
      }))
      .toPromise();
  }

  addUser(data) {
    return this.http
      .post(`${baseUrl}/add-user.json`, {
        username: data.username,
        site_id: data.siteCode,
        group_name: data.groupName
      })
      .toPromise();
  }

  removeUser(data) {
    return this.http
      .post(`${baseUrl}/remove-user.json`, {
        username: data.username,
        site_id: data.siteCode,
        group_name: data.groupName
      })
      .toPromise();
  }

}
