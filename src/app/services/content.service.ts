import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { map } from 'rxjs/operators';
import { StudioHttpService } from './http.service';
import { Asset } from '../models/asset.model';
import { Observable } from 'rxjs/Observable';
import { parseEntity } from '../utils/api.utils';

const baseUrl = `${environment.apiUrl}/content`;

@Injectable()
export class ContentService {

  constructor(private http: StudioHttpService) {
  }

  tree(projectCode, assetId, depth = 1) {
    return this.http.get(
      `${baseUrl}/get-items-tree.json`,
      { site: projectCode, path: assetId, depth })
      .pipe(map(response => <Asset>parseEntity(Asset, response.item)));
  }

  content(projectCode, assetId, edit = false): Observable<{ id, content }> {
    return this.http.get(
      `${baseUrl}/get-content.json`,
      { site: projectCode, path: assetId, edit })
      .pipe(
        map((resp: any) => ({ id: assetId, content: resp.content }))
      );
  }

}
