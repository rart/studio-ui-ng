import {Injectable} from '@angular/core';

import {User} from '../models/user.model';
import {
  IEntityService, PagedResponse, PostResponse, mapToPagedResponse, mapToPostResponse,
  StudioHttpService
} from './http.service';
import {environment} from '../../environments/environment';
import {Observable} from 'rxjs/Observable';

const baseUrl = `${environment.apiUrl}/user`;

@Injectable()
export class UserService implements IEntityService<User> {

  constructor(private http: StudioHttpService) {}

  all(options?): Promise<PagedResponse<User>> {
    return this.http
      .get(`${baseUrl}/get-all.json`, options)
      .map(mapToPagedResponse('users', User))
      .toPromise();
  }

  get(username: string): Promise<User> {
    return this.http
      .get(`${baseUrl}/get.json`, {username: username})
      .map((userJSON) => User.fromJSON(userJSON))
      .toPromise();
  }

  create(user: User): Promise<PostResponse<User>> {
    return this.http
      .post(`${baseUrl}/create.json`, user.export())
      .map(mapToPostResponse(user))
      .toPromise();
  }

  update(user: User): Promise<PostResponse<User>> {
    return this.http
      .post(`${baseUrl}/update.json`, user.export())
      .map(mapToPostResponse(user))
      .toPromise();
  }

  delete(user: User): Promise<PostResponse<User>> {
    return this.http.post(`${baseUrl}/delete.json`, user.export())
      .map(mapToPostResponse(user))
      .toPromise();
  }

  isEnabled(username): Promise<boolean> {
    return this.http.get(`${baseUrl}/status.json`, {username: username})
      .toPromise()
      .then((json) => json.enabled);
  }

  enable(user: User): Promise<PostResponse<User>> {
    return this.http.post(`${baseUrl}/enable.json`, {username: user.username})
      .map(mapToPostResponse(user))
      .toPromise();
  }

  disable(user: User): Promise<PostResponse<User>> {
    return this.http
      .post(`${baseUrl}/disable.json`, {username: user.username})
      .map(mapToPostResponse(user))
      .toPromise();
  }

  resetPassword(user: User) {
    return this.http
      .post(`${baseUrl}/reset-password.json`, {
        'username': user.username,
        'new': user.password
      })
      .map(mapToPostResponse(user))
      .toPromise();
  }

}
