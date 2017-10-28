import { Injectable } from '@angular/core';
import {Http} from '@angular/http';
import {environment} from '../../environments/environment';
import {fetchObservable, fetchPromise} from '../app.utils';
import {User} from '../models/user';

const baseUrl = `${environment.baseUrl}/user`;

@Injectable()
export class UserService {

  constructor(private http: Http) {}

  fetch(username) {
    return fetchPromise(
      this.http,
      `${baseUrl}/get.json`,
      { username: username })
      .then((userJSON) => {
        return User.fromJSON(userJSON);
      });
  }

  isEnabled(username) {
    return fetchPromise(
      this.http,
      `${baseUrl}/status.json`,
      { username: username })
      .then((json) => json.enabled);
  }

  all(options?) {
    let params = {  };
    return fetchPromise(
      this.http,
      `${baseUrl}/get-all.json`,
      options);
  }

  create(user: User) {
    return this.http.post(`${baseUrl}/create.json`, user.export())
      .map(resp => resp.json())
      .toPromise();
  }

  update(user: User) {
    return this.http.post(`${baseUrl}/update.json`, user.export())
      .map(resp => resp.json())
      .toPromise();
  }

  eliminate(user: User) {
    return this.http.post(`${baseUrl}/delete.json`, user.export())
      .map(resp => resp.json())
      .toPromise();
  }

  resetPassword(user: User) {
    return this.http.post(`${baseUrl}/reset-password.json`, { 'username': user.username, 'new': user.password })
      .map(resp => resp.json())
      .toPromise();
  }

}
