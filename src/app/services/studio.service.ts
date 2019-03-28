import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { Observable ,  BehaviorSubject } from 'rxjs';
import { StudioHttpService } from './http.service';

const appUrl = environment.url.app;

@Injectable()
export class StudioService {

  private _sidebarItems: BehaviorSubject<any> = new BehaviorSubject([]);
  public sidebarItems: Observable<any> = this._sidebarItems.asObservable();

  constructor(private http: StudioHttpService) {
  }

  fetchSidebarItems(): void {
    this.http.get(`${environment.apiUrl}/get-sidebar-items.json`)
      .subscribe(sidebarItems => {
        this._sidebarItems.next(sidebarItems);
      });
  }

  getGlobalNav(): Observable<any> {
    return this.http
      .get(`${appUrl}/fixtures/get-sidebar-items.json`, { 'project': 'my-project-name' });
  }

}
