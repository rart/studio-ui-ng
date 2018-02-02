import { Injectable } from '@angular/core';
import { map } from 'rxjs/operators';
import { StudioHttpService } from './http.service';
import { environment } from '../../environments/environment';
import { Asset } from '../models/asset.model';
import { PostResponse } from '../classes/post-response.interface';
import { ResponseCodesEnum } from '../enums/response-codes.enum';
import { parseEntity } from '../utils/api.utils';
import { isArray } from 'util';

const workflow = `${environment.apiUrl}/workflow`;
const deployment = `${environment.apiUrl}/deployment`;
const activity = `${environment.apiUrl}/activity`;
const content = `${environment.apiUrl}/content`;

const noCache = ((d) => d.toString())(new Date());
// const noCache = (() => (new Date()).toString());

const mappingFn = (data, categorized = true): WorkflowServiceResponse => {
  let assets, groups;
  if (categorized) {
    assets = [];
    groups = (data.documents || []).map(group => ({
      label: group.internalName,
      ids: group.children.map(entry => {
        let asset = <Asset>parseEntity(Asset, entry);
        assets.push(asset);
        return asset.id;
      })
    }));
  } else {
    assets = (data.documents || []).map((entry) => <Asset>parseEntity(Asset, entry));
  }
  return {
    total: data.total,
    sortedBy: data.sortedBy,
    ascending: (data.ascending === 'true'),
    assets: assets,
    groups: groups
  };
};

export interface WorkflowServiceResponse {
  total: number;
  sortedBy: string;
  ascending: boolean;
  assets: Asset[];
  groups: { label: string; ids: string[] }[];
}

const sortByFieldMap = {
  url: 'browserUri',
  name: 'internalName',
  label: 'internalName',
  lastEditedBy: 'user',
  lastEditedOn: 'eventDate'
};

const mix = (query, mixin = {}) => Object.assign({
  site: query.projectCode,
  sort: query.sortBy ? sortByFieldMap[query.sortBy] : 'eventDate',
  ascending: (query.sortDirection === 'ASC'),
  // TODO: check cache is not a problem just getting the buster at initialization
  nocache: noCache
}, mixin);

export enum AssetActionEnum {
  UPLOAD = 'UPLOAD',
  INFO = 'INFO',
  PREVIEW = 'PREVIEW',
  SCHEDULE = 'SCHEDULE',
  PUBLISH = 'PUBLISH',
  DUPLICATE = 'DUPLICATE',
  EDIT = 'EDIT',
  DELETE = 'DELETE',
  HISTORY = 'HISTORY',
  DEPENDENCIES = 'DEPENDENCIES'
}

export interface AssetMenuOption {
  label: string;
  action: string;
  options?: AssetMenuOption[];
  divider?: boolean;
}

@Injectable()
export class WorkflowService {

  constructor(private http: StudioHttpService) {
  }

  fetch(query?) {
    let fn;
    switch (query.status) {
      case 'pending': {
        fn = 'fetchPendingApproval';
        break;
      }
      case 'scheduled': {
        fn = 'fetchScheduled';
        break;
      }
      case 'activity': {
        fn = 'fetchUserActivities';
        break;
      }
      case 'published': {
        fn = 'fetchDeploymentHistory';
        break;
      }
      default: {
        throw new Error(`Unrecognized virtual status '${query.status}' specified for WorkflowService`);
      }
    }
    let cleanQuery = { ...query };
    delete cleanQuery.status;
    return this[fn](cleanQuery);
  }

  fetchPendingApproval(query: {
    projectCode,
    sortBy?,
    sortDirection?: 'ASC' | 'DESC',
    includeInProgress?
  }) {
    return this.http.get(
      `${workflow}/get-go-live-items.json`, mix(query, {
        includeInProgress: !!query.includeInProgress
      })).pipe(map(value => mappingFn(value)));
  }

  fetchScheduled(query: {
    projectCode,
    sortBy?,
    sortDirection?: 'ASC' | 'DESC',
    filterType?: 'ALL' | 'PAGES' | 'COMPONENTS' | 'DOCUMENTS'
  }) {
    return this.http
      .get(`${deployment}/get-scheduled-items.json`, mix(query, {
        filterType: query.filterType || 'all'
      })).pipe(map(value => mappingFn(value)));
  }

  fetchDeploymentHistory(query: {
    projectCode,
    num?: number,
    days?: number,
    sortBy?: string,
    sortDirection?: 'ASC' | 'DESC',
    filterType?: 'ALL' | 'PAGES' | 'COMPONENTS' | 'DOCUMENTS'
  }) {
    return this.http
      .get(`${deployment}/get-deployment-history.json`, mix(query, {
        num: query.num || 20,
        days: query.days || 30,
        filterType: query.filterType || 'all'
      })).pipe(map(value => mappingFn(value)));
  }

  // Not categorized
  fetchUserActivities(query: {
    projectCode,
    username?: string,
    num?: number,
    sortBy?: string,
    sortDirection?: 'ASC' | 'DESC',
    filterType?: 'ALL' | 'PAGES' | 'COMPONENTS' | 'DOCUMENTS',
    includeLive?: boolean
  }) {
    return this.http
      .get(`${activity}/get-user-activities.json`, mix(query, {
        user: query.username || 'admin',
        num: query.num || 20,
        filterType: query.filterType || 'all',
        excludeLive: (query.includeLive !== undefined) ? !query.includeLive : false
      })).pipe(map(value => mappingFn(value, false)));
  }

  getAvailableWorkflowOptions(user, assets): AssetMenuOption[] {
    if (!isArray(assets)) {
      assets = Object.values(assets);
    }
    return assets.length ? this.getAvailableAssetOptions(user, null) : [];
  }

  getAvailableAssetOptions(user, item): AssetMenuOption[] {
    return [
      { label: 'Get Info', action: AssetActionEnum.INFO },
      { label: 'Preview', action: AssetActionEnum.PREVIEW, divider: true },
      { label: 'Edit', action: AssetActionEnum.EDIT },
      { label: 'Delete', action: AssetActionEnum.DELETE },
      { label: 'Schedule', action: AssetActionEnum.SCHEDULE },
      { label: 'Publish', action: AssetActionEnum.PUBLISH },
      { label: 'History', action: AssetActionEnum.HISTORY },
      { label: 'Dependencies', action: AssetActionEnum.DEPENDENCIES, divider: true },
      { label: 'Duplicate', action: AssetActionEnum.DUPLICATE },
      { label: 'Upload', action: AssetActionEnum.UPLOAD }
    ];
  }

  assetStatusReport(projectCode, state) {
    return this.http.get(
      `${content}/get-item-states.json`,
      { site: projectCode, state })
      .pipe(
        map(response => <{ objectId, path, project, state, systemProcessing }[]>response.items),
        map(items => items.map(item => ({
          id: item.objectId,
          asset: {
            id: item.path,
            projectCode: item.project,
            workflowStatus: item.state
          },
          processing: item.systemProcessing
        })))
      );
  }

  setAssetStatus(projectCode, assetId, assetWorkflowStatus, processing) {
    let entity = {
      done: true,
      id: assetId,
      projectCode: projectCode,
      processing: processing,
      workflowStatus: assetWorkflowStatus
    };
    return this.http.post(
      `${content}/set-item-state.json`, null, {
        params: {
          site: projectCode,
          path: assetId,
          state: assetWorkflowStatus,
          systemprocessing: processing,
          nocache: new Date().toString()
        }
      })
      .pipe(
        map((resp: { result: string }) => {
          if (resp.result.toLowerCase() === 'success') {
            return <PostResponse<{ id, projectCode, processing, workflowStatus }>>{
              responseCode: ResponseCodesEnum.OK,
              entity
            };
          } else {
            throw new Error('setAssetStatusError');
          }
        })
      );
  }

}
