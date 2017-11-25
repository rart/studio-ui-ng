import {Injectable} from '@angular/core';
import {environment} from '../../environments/environment';
import {Observable} from 'rxjs/Observable';
import 'rxjs/add/operator/toPromise';
import 'rxjs/add/operator/map';
import {BehaviorSubject} from 'rxjs/BehaviorSubject';
import {StudioHttpService} from './http.service';

const appUrl = environment.appUrl;

@Injectable()
export class StudioService {

  private _sidebarItems: BehaviorSubject<any> = new BehaviorSubject([]);
  public sidebarItems: Observable<any> = this._sidebarItems.asObservable();

  constructor(private http: StudioHttpService) {}

  fetchSidebarItems(): void {
    this.http.get(`${environment.apiUrl}/get-sidebar-items.json`)
      .subscribe(sidebarItems => {
        this._sidebarItems.next(sidebarItems);
      });
  }

  getSidebarItems(): Promise<any> {
    return this.http
      .get(`${appUrl}/fixtures/get-sidebar-items.json`, { 'site': 'my-site-name' })
      .toPromise();
  }

}
