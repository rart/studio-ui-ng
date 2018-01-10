import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { map, switchMap } from 'rxjs/operators';
import { StudioHttpService } from './http.service';
import { Asset } from '../models/asset.model';
import { Observable } from 'rxjs/Observable';
import { parseEntity } from '../utils/api.utils';

const baseUrl = `${environment.apiUrl}/content`;

const extract = (uid: string) => {
  let
    pieces = uid.split(':'),
    projectCode = pieces[0],
    path = pieces[1];
  return {
    site: projectCode,
    path: path
  };
};

@Injectable()
export class ContentService {

  constructor(private http: StudioHttpService) {

  }

  byId(uid: string): Observable<Asset> {
    return this.http
      .get(`${baseUrl}/get-item.json`, extract(uid)).pipe(
        map(data => <Asset>parseEntity(Asset, data.item))
      );
  }

  tree(uid: string, depth = 1) {
    return this.http
      .get(
        `${baseUrl}/get-items-tree.json`,
        { ...extract(uid), depth })
      .pipe(
        map(response => <Asset>parseEntity(Asset, response.item))
      );
  }

  read(uid: string, edit = false): Observable<{ id, content }> {
    return this.http
      .get(
        `${baseUrl}/get-content.json`,
        { ...extract(uid), edit })
      .pipe(
        map((resp: any) => ({ id: uid, content: resp.content }))
      );
  }

  // TODO: reevaluate when assets have a Unique ID and/or API changes (see params construction)
  write(asset: Asset, newContent: string, unlock: boolean = false): Observable<Asset> {
    return this.http
      .post(`${baseUrl}/write-content.json`, newContent, {
        params: {
          user: 'admin',
          phase: 'onSave',
          site: asset.projectCode,
          path: asset.path,
          fileName: asset.fileName,
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
        path: `${asset.path}/${asset.fileName}`
      })
      .pipe(
        switchMap(() => this.byId(asset.id))
      );
  }

}
