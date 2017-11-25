import {Injectable} from '@angular/core';
import {environment} from '../../environments/environment';
import {map} from 'rxjs/operators';
import {StudioHttpService} from './http.service';
import {Asset} from '../models/asset.model';

// import {Observable} from 'rxjs/Observable';
// Old way...
// import 'rxjs/add/operator/map';
// import 'rxjs/add/operator/filter';
// New way...
// import {map, filter} from 'rxjs/operators';

const baseUrl = `${environment.apiUrl}/content`;

@Injectable()
export class ContentService {

  constructor(private httpService: StudioHttpService) {}

  tree(siteCode, path, depth = 1) {
    return this.httpService.get(
      `${baseUrl}/get-items-tree.json`,
      {site: siteCode, path, depth})
      .pipe(map(response => Asset.fromJSON(response.item)));
  }

}
