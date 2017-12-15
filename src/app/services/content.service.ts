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

  byId(projectCode: string, uniqueKey: string): Observable<Asset> {
    return this.http
      .get(`${baseUrl}/get-item.json`, {
        site: projectCode,
        path: uniqueKey
      }).pipe(
        map(data => <Asset>parseEntity(Asset, data.item))
      );
  }

  tree(projectCode, assetId, depth = 1) {
    return this.http
      .get(
        `${baseUrl}/get-items-tree.json`,
        { site: projectCode, path: assetId, depth })
      .pipe(
        map(response => <Asset>parseEntity(Asset, response.item))
      );
  }

  read(projectCode, assetId, edit = false): Observable<{ id, content }> {
    return this.http
      .get(
        `${baseUrl}/get-content.json`,
        { site: projectCode, path: assetId, edit })
      .pipe(
        map((resp: any) => ({ id: assetId, content: resp.content }))
      );
  }

  write(asset: Asset, newContent: string, unlock: boolean = false): Observable<Asset> {
    let
      path = asset.id,
      index = path.lastIndexOf('/'),
      directory = path.substr(0, index),
      fileName = path.substr(index + 1);
    return this.http
      .post(`${baseUrl}/write-content.json`, newContent, {
        params: {
          user: 'admin',
          phase: 'onSave',
          site: asset.projectCode,
          path: directory,
          fileName: fileName,
          nocache: `${Date.now()}`,
          unlock: `${unlock}`
        }
      }).pipe(
        map(data => <Asset>parseEntity(Asset, data.result.message))
      );
  }

  unlock(asset: Asset) {
    return this.http
      .get(`${baseUrl}/unlock-content.json`, {
        site: asset.projectCode,
        path: asset.id
      });
  }

}
