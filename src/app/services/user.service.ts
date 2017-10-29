import { Injectable } from '@angular/core';
import {Http} from '@angular/http';
import {environment} from '../../environments/environment';
import {httpPost, httpGet, fetchPromise} from '../app.utils';
import {User} from '../models/user';
import {Observable} from 'rxjs/Observable';

const baseUrl = `${environment.baseUrl}/user`;

export interface UserServicePagedResponse {
  total: number;
  users: User[];
}

export interface UserServicePostResponse {
  message: RestResponseMessages;
}

const RestResponseMessages = { OK: 'OK' };
type RestResponseMessages = (typeof RestResponseMessages)[keyof typeof RestResponseMessages];
export { RestResponseMessages };

@Injectable()
export class UserService {

  constructor(private http: Http) {}

  fetch(username): Promise<User> {
    let request = httpGet(this.http, `${baseUrl}/get.json`, { username: username }) as Observable<User>;
    return request.map((userJSON) => User.fromJSON(userJSON)).toPromise();
  }

  isEnabled(username): Promise<boolean> {
    let request = httpGet(this.http, `${baseUrl}/status.json`, { username: username }, true) as Promise<any>;
    return request.then((json) => json.enabled);
  }

  enable(user: User) {
    return httpPost(this.http, `${baseUrl}/enable.json`, { username: user.username }, true) as Promise<UserServicePostResponse>;
  }

  disable(user: User) {
    return httpPost(this.http, `${baseUrl}/disable.json`, { username: user.username }, true) as Promise<any>;
  }

  all(options?) {
    return httpGet(this.http, `${baseUrl}/get-all.json`, options, true) as Promise<UserServicePagedResponse>;
  }

  create(user: User) {
    return httpPost(this.http, `${baseUrl}/create.json`, user.export(), true) as Promise<UserServicePostResponse>;
  }

  update(user: User) {
    return httpPost(this.http, `${baseUrl}/update.json`, user.export(), true) as Promise<UserServicePostResponse>;
  }

  eliminate(user: User) {
    return httpPost(this.http, `${baseUrl}/delete.json`, user.export()) as Promise<UserServicePostResponse>;
  }

  resetPassword(user: User) {
    return httpPost(
      this.http, `${baseUrl}/reset-password.json`,
      { 'username': user.username, 'new': user.password }) as Promise<UserServicePostResponse>;
  }

}
