import { Injectable } from '@angular/core';

import { environment } from '../../environments/environment';
import { StudioHttpService } from './http.service';
import { map } from 'rxjs/operators';
import { API1Parser } from '../classes/api1-parser.class';
import { Observable } from 'rxjs';
import {
  APIResponse,
  CreateGroupPayload,
  DeletePayload,
  FetchGroupPayload,
  FetchGroupsPayload,
  FetchGroupUsersPayload
} from '../models/service-payloads';
import { Group } from '../models/group.model';
import { API2Parser, API2Serializer } from '../classes/api2-parser.class';
import { createEmptyUser, notNullOrUndefined } from '../app.utils';
import { Query } from '../models/query';

const baseUrl = '/studio/api/2/groups';
const api1BaseUrl = `${environment.apiUrl}/group`;

@Injectable()
export class GroupService {

  constructor(public http: StudioHttpService) {

  }

  page(options?: Query): Observable<FetchGroupsPayload> {
    const params: any = {};
    if (notNullOrUndefined(options)) {
      const { pageIndex, pageSize } = options;
      params.offset = pageIndex * pageSize;
      params.limit = pageSize;
    }
    return this.http.get(baseUrl, params).pipe(
      map(({ result: data }) => ({
        pageSize: data.limit,
        pageIndex: data.offset / data.limit,
        total: data.total,
        response: data.response,
        groups: data.entities.map(raw => API2Parser.group(raw))
      }))
    );
  }

  byId(id: number): Observable<FetchGroupPayload> {
    return this.http.get(`${baseUrl}/${id}`).pipe(
      map(({ result: data }) => ({
        id,
        group: API2Parser.group(data.entity),
        response: data.response
      }))
    );
  }

  create(group: Group): Observable<CreateGroupPayload> {
    return this.http.post(baseUrl, API2Serializer.group(group)).pipe(
      map(({ result: data }) => ({
        group: API2Parser.group(data.entity),
        response: data.response
      }))
    );
  }

  update(group: Group): Observable<CreateGroupPayload> {
    return this.http.patch(baseUrl, API2Serializer.group(group)).pipe(
      map(({ result: data }) => ({
        group: API2Parser.group(data.entity),
        response: data.response
      }))
    );
  }

  delete(id: number): Observable<DeletePayload> {
    return this.http.delete(`${baseUrl}`, { id }).pipe(
      map(({ result: data }) => ({ id, response: data.response }))
    );
  }

  members(id: number): Observable<FetchGroupUsersPayload> {
    return this.http.get(`${baseUrl}/${id}/members`).pipe(
      map(({ result: data }) => ({
        id,
        users: data.entities.map(API2Parser.user),
        response: data.response
      }))
    );
  }

  addMember(id: number, username: string): Observable<FetchGroupUsersPayload> {
    return this.addMembers(id, [username]);
  }

  addMembers(id: number, usernames: string[]): Observable<FetchGroupUsersPayload> {
    return this.http.post(`${baseUrl}/${id}/members`, { usernames: usernames }).pipe(
      map(({ result: data }) => ({
        id,
        users: data.entities.map(API2Parser.user),
        response: data.response
      }))
    );
  }

  deleteMember(id: number, username: string): Observable<FetchGroupUsersPayload> {
    return this.deleteMembers(id, [username]);
  }

  deleteMembers(id: number, usernames: string[]): Observable<FetchGroupUsersPayload> {
    return this.http.delete(`${baseUrl}/${id}/members`, { username: usernames }).pipe(
      map(({ result: data }) => ({
        id,
        users: usernames.map(username => createEmptyUser({ username })),
        response: data.response
      }))
    );
  }


  byProject(query?) {
    return this.http.get(`${api1BaseUrl}/get-all.json`, query)
      .pipe(map((data) => ({
        total: '(not provided by API)',
        projects: data.sites.map((dataItem) => {
          return API1Parser.project(dataItem);
        })
      })));
  }

  addUser(data) {
    return this.http
      .post(`${api1BaseUrl}/add-user.json`, {
        username: data.username,
        site_id: data.projectCode,
        group_name: data.groupName
      });
  }

  removeUser(data) {
    return this.http
      .post(`${api1BaseUrl}/remove-user.json`, {
        username: data.username,
        site_id: data.projectCode,
        group_name: data.groupName
      });
  }

}
