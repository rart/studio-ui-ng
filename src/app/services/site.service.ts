import { Injectable } from '@angular/core';
import {Http} from '@angular/http';

import {environment} from '../../environments/environment';
import {fetchObservable, fetchPromise} from '../app.utils';
import {Site} from '../models/site';

const baseUrl = `${environment.baseUrl}/site`;

@Injectable()
export class SiteService {

  constructor(public http: Http) { }

  all(query?) {
    return fetchObservable(this.http, `${baseUrl}/get-per-user.json`, { username: 'admin' })
      .map((data) => ({
          total: data.total,
          sites: data.sites.map((item) => Site.fromJSON(item))
      }))
      .toPromise();
  }

}
