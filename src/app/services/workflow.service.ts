import {Injectable} from '@angular/core';
import {StudioHttpService} from './http.service';
import {environment} from '../../environments/environment';
import {ContentItem} from '../models/content-item.model';

const workflow = `${environment.baseUrl}/workflow`;
const deployment = `${environment.baseUrl}/deployment`;
const activity = `${environment.baseUrl}/activity`;

const noCache = ((d) => d.toString()) (new Date());

const mappingFn = (data) => ({
  total: data.total,
  sortedBy: data.sortedBy,
  ascending: (data.ascending === 'true'),
  entries: (data.documents || []).map((entry) => ContentItem.fromJSON(entry))
});

@Injectable()
export class WorkflowService {

  constructor(private http: StudioHttpService) {
  }

  fetchPendingApproval(query: {
    siteCode,
    sortBy?,
    sortDirection?: 'ASC' | 'DESC',
    includeInProgress?
  }) {
    return this.http
      .get(`${workflow}/get-go-live-items.json`, {
        site: query.siteCode,
        sort: query.sortBy || 'eventDate',
        ascending: (query.sortDirection === 'ASC'),
        includeInProgress: (query.includeInProgress !== undefined)
          ? query.includeInProgress
          : true,
        nocache: noCache
      }).map(mappingFn);
  }

  fetchScheduled(query: {
    siteCode,
    sortBy?,
    sortDirection?: 'ASC' | 'DESC',
    filterType?: 'ALL' | 'PAGES' | 'COMPONENTS' | 'DOCUMENTS'
  }) {
    return this.http
      .get(`${deployment}/get-scheduled-items.json`, {
        site: query.siteCode,
        sort: query.sortBy || 'eventDate',
        ascending: query.sortDirection ? (query.sortDirection === 'ASC') : false,
        filterType: query.filterType || 'all',
        nocache: noCache
      }).map(mappingFn);
  }

  fetchDeploymentHistory(query: {
    siteCode,
    num?: number,
    days?: number,
    sortBy?: string,
    sortDirection?: 'ASC' | 'DESC',
    filterType?: 'ALL' | 'PAGES' | 'COMPONENTS' | 'DOCUMENTS'
  }) {
    return this.http
      .get(`${deployment}/get-deployment-history.json`, {
        site: query.siteCode,
        num: query.num || 20,
        days: 30 || query.days,
        sort: query.sortBy || 'eventDate',
        ascending: query.sortDirection ? (query.sortDirection === 'ASC') : false,
        filterType: query.filterType || 'all',
        nocache: noCache
      }).map(mappingFn);
  }

  fetchUserActivities(query: {
    siteCode,
    username?: string,
    num?: number,
    sortBy?: string,
    sortDirection?: 'ASC' | 'DESC',
    filterType?: 'ALL' | 'PAGES' | 'COMPONENTS' | 'DOCUMENTS',
    includeLive?: boolean
  }) {
    return this.http
      .get(`${activity}/get-user-activities.json`, {
        site: query.siteCode,
        user: query.username || 'admin',
        num: 10 || query.num,
        sort: 'eventDate' || query.sortBy,
        ascending: query.sortDirection ? (query.sortDirection === 'ASC') : false,
        filterType: 'all',
        excludeLive: query.includeLive !== undefined ? !query.includeLive : false,
        nocache: noCache
      }).map(mappingFn);
  }

}
