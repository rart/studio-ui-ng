import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { map, switchMap, combineLatest } from 'rxjs/operators';
import { StudioHttpService } from './http.service';
import { Asset } from '../models/asset.model';
import { Observable ,  forkJoin } from 'rxjs';
import { LookupTable } from '../classes/app-state.interface';
import { PublishingChannel } from '../models/publishing-channel.model';
import { API1Parser } from '../classes/api1-parser.class';

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
        map(response => API1Parser.asset(response.item))
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
        map(data => API1Parser.asset(data.result.message))
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

  dependants(id: string, recursive?: boolean): Observable<DependantsResponse>;
  dependants(asset: Asset, recursive?: boolean): Observable<DependantsResponse>;
  dependants(ids: string[], recursive?: boolean): Observable<DependantsResponse>;
  dependants(assets: Asset[], recursive?: boolean): Observable<DependantsResponse>;
  dependants(assets: string | Asset | string[] | Asset[], recursive: boolean = false): Observable<DependantsResponse> {

    let ids, projectCode;

    if (typeof assets === 'string') {
      // The composed asset ID itself
      ids = [assets];
    } else if (assets instanceof Asset) {
      // The actual Asset model instance
      ids = [assets.id];
    } else {
      // An array of IDs or Asset models
      ids = (assets[0] instanceof Asset) ? (<Asset[]>assets).map(a => a.id) : assets;
    }

    projectCode = extractProjectCodeFromId(assets[0]);
    ids = arrayOfAssetIds(ids).map(id => ({ uri: id }));

    return this.http.post(`${dependency}/get-dependencies.json`, JSON.stringify(ids), {
      headers: {
        'Content-Type': 'application/json; charset=UTF-8'
      },
      params: {
        site: projectCode,
        deletedep: `${recursive}`,
        nocache: `${Date.now()}`
      }
    }).pipe(switchMap((response: API3DependenciesResponse) => {

      let parsedItems: Asset[] = response.items.map(item => API1Parser.asset(item));

      let answer: DependantsResponse = {
        entries: parsedItems.map((asset) => ({
          assetId: asset.id,
          dependantIds: (<Asset[]>asset.children || []).map(child => child.id)
        })),
        dependantIdsLookup: parsedItems.reduce((table, asset) => {
          table[asset.id] = (<Asset[]>asset.children || []).map(child => child.id);
          return table;
        }, {}),
        assetLookup: {}
      };

      let items = [];
      flattenDeleteDepsRecursive(parsedItems, items, []);

      let requests = items.map((item) => this.byId(item.id));
      return forkJoin(requests)
        .pipe(
          map(responses => {
            answer.assetLookup = responses.reduce((table, asset) => {
              table[asset.id] = asset;
              return table;
            }, answer.assetLookup);
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
  delete(ids: string[]);
  delete(assets: Asset[]);
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

  history(id: string): Observable<HistoryResponse>;
  history(asset: Asset): Observable<HistoryResponse>;
  history(ids: string[]): Observable<HistoryResponse>;
  history(assets: Asset[]): Observable<HistoryResponse>;
  history(assets: string[] | Asset[] | string | Asset): Observable<HistoryResponse> {

    let ids, modelRequests, historyRequests;

    if (typeof assets === 'string') {
      ids = [assets];
    } else if (assets instanceof Asset) {
      ids = [assets.id];
    } else {
      ids = (assets[0] instanceof Asset) ? (<Asset[]>assets).map(a => a.id) : assets;
    }

    modelRequests = ids.map(id => this.byId(id));
    historyRequests = ids.map(id => this.http.get(`${content}/get-item-versions.json`, {
      ...extract(id),
      maxhistory: 100,
      nocache: `${Date.now()}`
    }));

    return forkJoin(...historyRequests)
      .pipe(combineLatest(
        forkJoin(...modelRequests),
        (histories: any[], models: Asset[]) => {

          let answer = { entries: [], assetLookup: {}, historyLookup: {} };

          histories.forEach(response => {
            let asset = API1Parser.asset(response.item);
            let versions = <AssetHistoryItem[]>response.versions.map(v => ({
              comment: v.comment,
              modifiedOn: v.lastModifiedDate,
              modifiedBy: v.lastModifier,
              version: v.versionNumber
            }));
            answer.historyLookup[asset.id] = versions;
            answer.entries.push({ assetId: asset.id, versions });
          });

          models.forEach(asset => {
            answer.assetLookup[asset.id] = asset;
          });

          return answer;

        }));

  }

  publishingChannels(projectCode: string) {
    return this.http.get(`${environment.apiUrl}/deployment/get-available-publishing-channels.json`, {
      site: projectCode
    }).pipe(map(response =>
      response.availablePublishChannels.map(channel =>
        PublishingChannel.deserialize(channel))
    ));
  }

  prePublishReport(id: string): Observable<PrePublishReportResponse>;
  prePublishReport(asset: Asset): Observable<PrePublishReportResponse>;
  prePublishReport(ids: string[]): Observable<PrePublishReportResponse>;
  prePublishReport(assets: Asset[]): Observable<PrePublishReportResponse>;
  prePublishReport(assets: string | Asset | string[] | Asset[]): Observable<PrePublishReportResponse> {

    let ids, projectCode, dependencies$, channels$;

    if (typeof assets === 'string') {
      ids = [assets];
    } else if (assets instanceof Asset) {
      ids = [assets.id];
    } else {
      ids = (assets[0] instanceof Asset) ? (<Asset[]>assets).map(a => a.id) : assets;
    }

    projectCode = extractProjectCodeFromId(ids[0]);

    dependencies$ = this.dependants(<any>assets, false);

    channels$ = this.publishingChannels(projectCode);

    return forkJoin(dependencies$, channels$)
      .pipe(map(responses => {
        let answer = { dependencies: null, channels: null };
        answer.dependencies = responses[0];
        answer.channels = responses[1];
        return answer;
      }));

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

interface DependantsResponse {
  dependantIdsLookup: LookupTable<string[]>;
  assetLookup: LookupTable<Asset>;
  entries: Array<{ assetId: string; dependantIds: string[] }>;
}

interface AssetHistoryItem {
  comment: string;
  modifiedOn: string;
  modifiedBy: string;
  version: string;
}

interface HistoryResponse {
  historyLookup: LookupTable<AssetHistoryItem[]>;
  assetLookup: LookupTable<Asset>;
  entries: Array<{ assetId: string; versions: AssetHistoryItem[] }>;
}

interface PrePublishReportResponse {
  dependencies: DependantsResponse;
  channels: PublishingChannel[];
}

interface API3DependenciesResponse {
  items: any[];
  dependencies: any[];
  submissionComment: string;
}
