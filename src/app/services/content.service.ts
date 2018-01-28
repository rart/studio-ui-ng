import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { delay, map, switchMap } from 'rxjs/operators';
import { StudioHttpService } from './http.service';
import { Asset } from '../models/asset.model';
import { Observable } from 'rxjs/Observable';
import { parseEntity } from '../utils/api.utils';
import { forkJoin } from 'rxjs/observable/forkJoin';
import { LookUpTable } from '../classes/app-state.interface';
import { of } from 'rxjs/observable/of';

const content = `${environment.apiUrl}/content`;
const dependency = `${environment.apiUrl}/dependency`;
const workflow = `${environment.apiUrl}/workflow`;

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

    // Get item API replies with wrong information for numOfChildren call
    // get-item vs get-items-tree are inconsistent in their response.

    // return this.http
    //   .get(`${content}/get-item.json`, extract(uid)).pipe(
    //     map(data => <Asset>parseEntity(Asset, data.item))
    //   );

    // Using only get-items-tree until this is sorted or fully understood.
    return this.tree(uid);

  }

  tree(uid: string, depth = 1) {
    return this.http
      .get(`${content}/get-items-tree.json`, { ...extract(uid), depth })
      .pipe(
        map(response => <Asset>parseEntity(Asset, response.item))
      );
  }

  read(uid: string, edit = false): Observable<{ id, content }> {
    return this.http
      .get(
        `${content}/get-content.json`,
        { ...extract(uid), edit })
      .pipe(
        map((resp: any) => ({ id: uid, content: resp.content }))
      );
  }

  // TODO: reevaluate when assets have a Unique ID and/or API changes (see params construction)
  write(asset: Asset, newContent: string, unlock: boolean = false): Observable<Asset> {
    return this.http
      .post(`${content}/write-content.json`, newContent, {
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
      .get(`${content}/unlock-content.json`, {
        site: asset.projectCode,
        path: `${asset.path}/${asset.fileName}`
      })
      .pipe(
        switchMap(() => this.byId(asset.id))
      );
  }

  fetchDeleteDependants(assets: Asset[]): Observable<DeleteDependenciesResponse>;
  fetchDeleteDependants(ids: string[]): Observable<DeleteDependenciesResponse>;
  fetchDeleteDependants(assets: string[] | Asset[]): Observable<DeleteDependenciesResponse> {

    let projectCode = extractProjectCodeFromId(assets[0]);
    let ids = arrayOfAssetIds(assets).map(id => ({ uri: id }));

    return this.http.post(`${dependency}/get-dependencies.json`, JSON.stringify(ids), {
      headers: {
        'Content-Type': 'application/json; charset=UTF-8'
      },
      params: {
        site: projectCode,
        deletedep: 'true',
        nocache: `${Date.now()}`
      }
    }).pipe(switchMap((response: API3DependenciesResponse) => {

      let parsedItems: Asset[] = response.items.map(item => <Asset>parseEntity(Asset, item));

      let answer: DeleteDependenciesResponse = {
        entries: parsedItems.map((asset) => ({
          assetId: asset.id,
          dependantIds: (asset.children || []).map(child => child.id)
        })),
        dependants: parsedItems.reduce((table, asset) => {
          table[asset.id] = (asset.children || []).map(child => child.id);
          return table;
        }, {}),
        lookUpTable: {}
      };

      let items = [];
      flattenDeleteDepsRecursive(parsedItems, items, []);

      let requests = items.map((item) => this.byId(item.id));
      return forkJoin(requests)
        .pipe(
          map(responses => {
            answer.lookUpTable = responses.reduce((table, asset) => {
              table[asset.id] = asset;
              return table;
            }, answer.lookUpTable);
            return answer;
          })
        );

    }));

  }

  /*
   * Sample:
   * workflow/go-delete.json?deletedep=true&site=launcher&user=admin&nocache=
      {
         "status": 200,
         "commitId": null,
         "success": true,
         "invalidateCache": false,
         "item": null,
         "message": "Item(s) has been pushed for delete. It will be deleted shortly."
       }
   */
  delete(assets: Asset[]);
  delete(ids: string[]);
  delete(assets: string[] | Asset[]) {

    let projectCode = extractProjectCodeFromId(assets[0]);
    let ids = { items: arrayOfAssetIds(assets) };

    return this.http.post(`${workflow}/go-delete.json`, JSON.stringify(ids), {
      headers: {
        'Content-Type': 'application/json; charset=UTF-8'
      },
      params: {
        deletedep: 'true',
        site: projectCode,
        nocache: `${Date.now()}`
      }
    }).pipe(map(response => ({ message: response.message })));

    // Fake delete for testing purposes while not stable...
    // return of({ message: 'Yeah, buddy.' }).pipe(
    //   delay(1500),
    //   map(response => ({ message: response.message })));

  }

}

function extractProjectCodeFromId(asset) {
  return extract(
    (typeof asset === 'string')
      ? (<string>asset)
      : (<Asset>asset).id
  ).site;
}

function arrayOfAssetIds(assets) {
  return ((typeof assets[0] === 'string')
    ? assets.map((id: string) => extract(id).path)
    : assets.map((asset: Asset) => asset.id.replace(`${asset.projectCode}:`, '')));
}

function flattenDeleteDepsRecursive(source, destination, duplicateControl) {
  source.forEach(asset => {
    if (!duplicateControl.includes(asset.id)) {
      duplicateControl.push(asset.id);
      destination.push(asset);
    }
    if (asset.children && asset.children.length) {
      flattenDeleteDepsRecursive(asset.children, destination, duplicateControl);
    }
  });
}

interface DeleteDependenciesResponse {
  dependants: LookUpTable<string[]>;
  entries: { assetId: string; dependantIds: string[] } [];
  lookUpTable: LookUpTable<Asset>;
}

interface API3DependenciesResponse {
  items: any[];
  dependencies: any[];
  submissionComment: string;
}
