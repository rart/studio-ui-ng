import { Injectable } from '@angular/core';

import { User } from '../models/user.model';
import {
  // mapToPagedResponse,
  // mapToPostResponse,
  StudioHttpService
} from './http.service';
import { environment } from '../../environments/environment';
import { Observable } from 'rxjs/Observable';
import { catchError, combineLatest, map, tap } from 'rxjs/operators';
import { EntityService } from '../classes/entity-service.interface';
import { PagedResponse } from '../classes/paged-response.interface';
import { PostResponse } from '../classes/post-response.interface';
import { parseEntity } from '../utils/api.utils';

const baseUrl = `${environment.apiUrl}/user`;
const security = `${environment.apiUrl}/security`;

@Injectable()
export class UserService implements EntityService<User> {
  constructor(private http: StudioHttpService) {

  }

  all(query?): Observable<User[]> {
    return this.http
      .get(`${baseUrl}/get-all.json`, query)
      .pipe(
        map(data => data.users.map(pojo => <User>parseEntity(User, pojo)))
      );
  }

  page(options?): Observable<PagedResponse<User>> {
    return this.http
      .get(`${baseUrl}/get-all.json`, options)
      .pipe(
        catchError(e => {
          if (e.status === 401) {

          }
          return Observable.of({ total: 0, users: [] });
        }),
        map(StudioHttpService.mapToPagedResponse('users', User))
      );
  }

  by(entityProperty: string, value): Observable<User> {
    return undefined;
  }

  byId(username: string): Observable<User> {
    return this.http
      .get(`${baseUrl}/get.json`, { username: username })
      .pipe(
        map((userJSON) => <User>parseEntity(User, userJSON)),
        combineLatest(this.isEnabled(username), (user: User, enabled: boolean) => {
          user.enabled = enabled;
          return user;
        })
      );
  }

  create(user: User): Observable<PostResponse<User>> {
    return this.http
      .post(`${baseUrl}/create.json`, user.export())
      .pipe(map(StudioHttpService.mapToPostResponse(user)));
  }

  update(user: User): Observable<PostResponse<User>> {
    return this.http
      .post(`${baseUrl}/update.json`, user.export())
      .pipe(map(StudioHttpService.mapToPostResponse(user)));
  }

  delete(user: User): Observable<PostResponse<User>> {
    return this.http.post(`${baseUrl}/delete.json`, user.export())
      .pipe(map(StudioHttpService.mapToPostResponse(user)));
  }

  isEnabled(username): Observable<boolean> {
    return this.http
      .get(`${baseUrl}/status.json`, { username: username })
      .pipe(map((json) => json.enabled));
  }

  enable(user: User): Observable<PostResponse<User>> {
    return this.http
      .post(`${baseUrl}/enable.json`, { username: user.username })
      .pipe(map(StudioHttpService.mapToPostResponse(user)));
  }

  disable(user: User): Observable<PostResponse<User>> {
    return this.http
      .post(`${baseUrl}/disable.json`, { username: user.username })
      .pipe(map(StudioHttpService.mapToPostResponse(user)));
  }

  resetPassword(user: User) {
    return this.http
      .post(`${baseUrl}/reset-password.json`, {
        'username': user.username,
        'new': user.password
      })
      .pipe(map(StudioHttpService.mapToPostResponse(user)));
  }

  login(user: User) {
    return this.http
      .post(`${security}/login.json`, user)
      .pipe(map(response => <User>parseEntity(User, response)));
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

}
