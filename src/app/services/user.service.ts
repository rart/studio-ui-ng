import { Injectable } from '@angular/core';

import { User } from '../models/user.model';
import {
  // mapToPagedResponse,
  // mapToPostResponse,
  StudioHttpService
} from './http.service';
import { environment } from '../../environments/environment';
import { Observable } from 'rxjs/Observable';
import { combineLatest, map } from 'rxjs/operators';
import { EntityService } from '../classes/entity-service.interface';
import { PagedResponse } from '../classes/paged-response.interface';
import { PostResponse } from '../classes/post-response.interface';
import { parseEntity } from '../utils/api.utils';

const baseUrl = `${environment.apiUrl}/user`;

@Injectable()
export class UserService implements EntityService<User> {
  constructor(private http: StudioHttpService) {

  }

  all(query?): Observable<User[]> {
    return this.http
      .get(`${baseUrl}/get-all.json`, query)
      .map(data => data.users.map(pojo => <User>parseEntity(User, pojo)));
  }

  page(options?): Observable<PagedResponse<User>> {
    return this.http
      .get(`${baseUrl}/get-all.json`, options)
      .map(StudioHttpService.mapToPagedResponse('users', User));
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
      .map(StudioHttpService.mapToPostResponse(user));
  }

  update(user: User): Observable<PostResponse<User>> {
    return this.http
      .post(`${baseUrl}/update.json`, user.export())
      .map(StudioHttpService.mapToPostResponse(user));
  }

  delete(user: User): Observable<PostResponse<User>> {
    return this.http.post(`${baseUrl}/delete.json`, user.export())
      .map(StudioHttpService.mapToPostResponse(user));
  }

  isEnabled(username): Observable<boolean> {
    return this.http.get(`${baseUrl}/status.json`, { username: username })
      .map((json) => json.enabled);
  }

  enable(user: User): Observable<PostResponse<User>> {
    return this.http.post(`${baseUrl}/enable.json`, { username: user.username })
      .map(StudioHttpService.mapToPostResponse(user));
  }

  disable(user: User): Observable<PostResponse<User>> {
    return this.http
      .post(`${baseUrl}/disable.json`, { username: user.username })
      .map(StudioHttpService.mapToPostResponse(user));
  }

  resetPassword(user: User) {
    return this.http
      .post(`${baseUrl}/reset-password.json`, {
        'username': user.username,
        'new': user.password
      })
      .map(StudioHttpService.mapToPostResponse(user));
  }

}
