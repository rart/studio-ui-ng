import {Injectable} from '@angular/core';
import {Http, RequestOptionsArgs} from '@angular/http';
import {environment} from '../../environments/environment';
import {Observable} from 'rxjs/Observable';
import 'rxjs/add/operator/toPromise';
import 'rxjs/add/operator/map';
import {BehaviorSubject} from 'rxjs/BehaviorSubject';
import {fetchObservable, fetchPromise} from '../app.utils';

@Injectable()
export class StudioService {

  private _sidebarItems: BehaviorSubject<any> = new BehaviorSubject([]);
  public sidebarItems: Observable<any> = this._sidebarItems.asObservable();

  constructor(private http: Http) {}

  fetchSidebarItems(): void {
    fetchObservable(this.http, `${environment.baseUrl}/get-sidebar-items.json`)
      .subscribe(sidebarItems => {
        this._sidebarItems.next(sidebarItems);
      });
  }

  getSidebarItems(): Promise<any> {
    return fetchPromise(this.http,
      `/fixtures/get-sidebar-items.json`,
      { 'site': 'my-site-name' });
  }

}
