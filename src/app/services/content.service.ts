import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { map } from 'rxjs/operators';
import { StudioHttpService } from './http.service';
import { Asset } from '../models/asset.model';
import { Observable } from 'rxjs/Observable';
import { parse } from '../app.utils';

const baseUrl = `${environment.apiUrl}/content`;

@Injectable()
export class ContentService {

  constructor(private httpService: StudioHttpService) {
  }

  tree(siteCode, assetId, depth = 1) {
    return this.httpService.get(
      `${baseUrl}/get-items-tree.json`,
      { site: siteCode, path: assetId, depth })
      .pipe(map(response => <Asset>parse(Asset, response.item)));
  }

  content(siteCode, assetId, edit = false): Observable<{ id, content }> {
    return this.httpService.get(
      `${baseUrl}/get-content.json`,
      { site: siteCode, path: assetId, edit })
      .pipe(
        map((resp: any) => ({ id: assetId, content: resp.content }))
      );
  }

}
