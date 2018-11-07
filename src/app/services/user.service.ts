import { Injectable } from '@angular/core';
import { User } from '../models/user.model';
import { StudioHttpService } from './http.service';
import { environment } from '../../environments/environment';
import { Observable } from 'rxjs/Observable';
import { catchError, map, onErrorResumeNext } from 'rxjs/operators';
import { PostResponse } from '../classes/post-response.interface';
import { API1Parser } from '../classes/api1-parser.class';
import { BasicUsersPayload, BulkDeletePayload, DeletePayload } from '../models/service-payloads';
import { CreateUserPayload, FetchUserPayload, FetchUsersPayload } from '../models/service-payloads';
import { API2Parser } from '../classes/api2-parser.class';
import { createEmptyUser, getDefaultQuery, notNullOrUndefined } from '../app.utils';
import { of } from 'rxjs/observable/of';
import { Query } from '../models/query';

const baseUrl = `/studio/api/2/users`;
const security = `${environment.apiUrl}/security`;

function cleanModel(user: User, deleteProps = []) {
  const body = { ...user };
  [
    // Delete props the service doesn't accept.
    'avatarUrl',
    'authenticationType',
    ...deleteProps
  ].forEach(prop => delete body[prop]);
  return body;
}

@Injectable()
export class UserService {

  constructor(private http: StudioHttpService) {

  }

  page(options: Query = getDefaultQuery()): Observable<FetchUsersPayload> {
    const { pageIndex, pageSize } = options;
    const params = {
      offset: pageIndex * pageSize,
      limit: pageSize
    };
    return this.http
      .get(baseUrl, params)
      .pipe(
        map(({ result: data }) => ({
          pageSize: data.limit,
          // Bug in the service is not reliably returning the requested limit
          // but rather the number of results from the requested page.
          pageIndex: data.offset / (notNullOrUndefined(pageSize) ? pageSize : data.limit),
          total: data.total,
          response: data.response,
          users: data.entities.map(raw => API2Parser.user(raw))
        }))
      );
  }

  byId(id: number): Observable<FetchUserPayload>;
  byId(username: string): Observable<FetchUserPayload>;
  byId(id: string | number): Observable<FetchUserPayload> {
    return this.http
      .get(`${baseUrl}/${id}`)
      .pipe(
        map(({ result: data }) => ({
          id,
          user: API2Parser.user(data.entity),
          response: data.response
        })),
        catchError(({ error }) => {
          const { result: data } = error;
          return of({
            id,
            user: createEmptyUser(typeof id === 'number' ? { id } : { username: id }),
            response: data.response
          });
        })
      );
  }

  create(user: User): Observable<CreateUserPayload> {
    const body = cleanModel(user);
    return this.http
      .post(baseUrl, body)
      .pipe(
        map(({ result: data }) => ({
          user: API2Parser.user(data.entity),
          response: data.response
        }))
      );
  }

  update(user: User): Observable<CreateUserPayload> {
    const body = cleanModel(user);
    return this.http
      .patch(baseUrl, body)
      .pipe(
        map(({ result: data }) => ({
          user: API2Parser.user(data.entity),
          response: data.response
        }))
      );
  }

  delete(id: number): Observable<DeletePayload>;
  delete(ids: Array<number>): Observable<BulkDeletePayload>;
  delete(username: string): Observable<DeletePayload>;
  delete(usernames: Array<string>): Observable<BulkDeletePayload>;
  delete(id: string | number | Array<string | number>): Observable<DeletePayload | BulkDeletePayload> {
    let
      bulk = false,
      type = typeof id,
      param: any = {};
    switch (type) {
      case 'number':
        param.id = id;
        break;
      case 'string':
        param.username = id;
        break;
      case 'object':
      default:
        bulk = true;
        param = new URLSearchParams();
        (<Array<any>>id)
          .forEach((value) => param.append(
            (typeof value === 'number') ? 'id' : 'username',
            value)
          );
    }
    return this.http
      .delete(baseUrl, param)
      .pipe(
        map(({ result: data }) => ({
          response: data.response,
          ...(
            bulk
              ? { ids: (id as Array<string | number>) }
              : { id: (id as (string | number)) }
          )
        }))
      );
  }

  setEnabled(id: number, enabled: boolean): Observable<CreateUserPayload>;
  setEnabled(username: string, enabled: boolean): Observable<CreateUserPayload>;
  setEnabled(ids: number[], enabled: boolean): Observable<BasicUsersPayload>;
  setEnabled(usernames: string[], enabled: boolean): Observable<BasicUsersPayload>;
  setEnabled(
    identifiers: string | number | string[] | number[],
    enabled: boolean
  ): Observable<CreateUserPayload | BasicUsersPayload> {
    let
      type = typeof identifiers,
      bulk = type === 'object',
      param: any = {};
    switch (type) {
      case 'number':
        param.userIds = [identifiers];
        break;
      case 'string':
        param.usernames = [identifiers];
        break;
      case 'object':
      default:
        if (typeof identifiers[0] === 'string') {
          param.usernames = identifiers;
        } else {
          param.userIds = identifiers;
        }
    }
    return this.http
      .patch(`${baseUrl}/${enabled ? 'enable' : 'disable'}`, param)
      .pipe(
        map(({ result: data }) => {
          return (bulk) ? {
            response: data.response,
            users: data.entities.map(raw => API2Parser.user(raw))
          } : {
            response: data.result.response,
            user: API2Parser.user(data.result.entities[0])
          };
        })
      );
  }

  resetPassword(user: User): Observable<PostResponse<User>> {
    return this.http
      .post(`/studio/api/1/services/api/1/user/reset-password.json`, {
        'username': user.username,
        'new': user.password
      })
      .pipe(map(StudioHttpService.mapToPostResponse(user)));
  }

  login(user: User): Observable<User> {
    return this.http
      .post(`${security}/login.json`, user)
      .pipe(
        map(response => API1Parser.user(response))
      );
  }

  logout() {
    return this.http.post(`${security}/logout.json`);
  }

  recover(user: User) {
    return this.http.get(`${security}/forgot-password.json`, {
      username: user.username
    });
  }

  retrieve() {
    // TODO: must mock this up for the time being...
    // This should return the initial state (with the user) if there's a session
    return this.http.get(`${security}/validate-session.json`);
  }

  validateSession() {
    return this.http.get(`${security}/validate-session.json`).pipe(
      onErrorResumeNext(of({}))
    );
  }

}
