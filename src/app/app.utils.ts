import { AnonymousSubscription } from 'rxjs/Subscription';
import { environment } from '../environments/environment';
import { Observable } from 'rxjs/Observable';
import { combineLatest, takeUntil } from 'rxjs/operators';
import { PagedResponse } from './classes/paged-response.interface';
import { PagerConfig } from './classes/pager-config.interface';
import { isNullOrUndefined } from 'util';

export function notNullOrUndefined(value) {
  return !isNullOrUndefined(value);
}

export function createLocalPagination$<T>
({
   source$,
   pager$,
   filter$ = of(''),
   filterFn = (item, query) => true,
   takeUntilOp = takeUntil(never()),

   // can't filter directly on the filter$ since it wouldn't
   // clear the search filter when e.g. deleting the whole query
   // from the search input.
   filterIf = (query, items, pagerConf) => query !== ''

 }): Observable<PagedResponse<T>> {
  return source$
    .pipe(
      combineLatest(pager$, filter$,
        (items: T[], pagerConfig: PagerConfig, query: any) => {
          let
            filtered = items,
            queryTotal,
            sliceStart,
            sliceEnd;
          if (filterIf(query, items, pagerConfig)) {
            filtered = items.filter(item => filterFn(item, query));
          }
          queryTotal = filtered.length;
          if (queryTotal < pagerConfig.pageSize) {
            pagerConfig.pageIndex = 0;
          } else if (queryTotal <= (pagerConfig.pageIndex * pagerConfig.pageSize)) {
            pagerConfig.pageIndex = Math.floor(queryTotal / pagerConfig.pageSize);
          }
          sliceStart = pagerConfig.pageIndex * pagerConfig.pageSize;
          sliceEnd = pagerConfig.pageSize + (pagerConfig.pageIndex * pagerConfig.pageSize);
          return {
            total: items.length,
            entries: filtered.slice(sliceStart, sliceEnd),
            queryTotal: queryTotal
          };
        }
      ),
      takeUntilOp
    );
}

export function isSuccessResponse(response: APIResponse) {
  return ([0, 1, 2].includes(response.code));
}

export function getDefaultModelState(mixin = {}): ModelState<any> {
  return {
    byId: {},
    loading: {},
    results: {},
    ...mixin
  };
}

import { Asset } from './models/asset.model';
import { AssetTypeEnum } from './enums/asset-type.enum';
import { User } from './models/user.model';
import { Group } from './models/group.model';
import { of } from 'rxjs/observable/of';
import { never } from 'rxjs/observable/never';
import { APIResponse } from './models/service-payloads';
import { ModelState } from './classes/app-state.interface';
import { Query } from './models/query';

export function orderAssetsFoldersFirst(assets: Asset[]) {
  return assets.sort((a, b) => {
    if (a.type === AssetTypeEnum.FOLDER && b.type !== AssetTypeEnum.FOLDER) {
      return -1;
    } else if (a.type !== AssetTypeEnum.FOLDER && b.type === AssetTypeEnum.FOLDER) {
      return 1;
    } else {
      return 0;
    }
  });
}

export const asAnonymousSubscription = (unsubscribe: () => void): AnonymousSubscription => {
  return { unsubscribe: unsubscribe };
};

export function fullName(user: User) {
  return `${user.firstName} ${user.lastName}`;
}

export function createEmptyUser(mixin: Partial<User> = {}): User {
  return {
    id: null,
    email: '',
    username: '',
    firstName: '',
    lastName: '',
    enabled: true,
    password: null,
    externallyManaged: false,
    authenticationType: '',
    avatarUrl: null,
    ...mixin
  };
}

export function createEmptyGroup(mixin: Partial<Group> = {}): Group {
  return {
    id: null,
    name: '',
    description: '',
    ...mixin
  };
}

const avatarsURL = `${environment.assetsUrl}/img/avatars`;

export const AVATARS = [
  `${avatarsURL}/daniel.jpg`,
  `${avatarsURL}/elyse.png`,
  `${avatarsURL}/jenny.jpg`,
  `${avatarsURL}/matt.jpg`,
  `${avatarsURL}/molly.png`,
  `${avatarsURL}/stevie.jpg`,
  `${avatarsURL}/elliot.jpg`,
  `${avatarsURL}/helen.jpg`,
  `${avatarsURL}/kristy.png`,
  `${avatarsURL}/matthew.png`,
  `${avatarsURL}/steve.jpg`,
  `${avatarsURL}/veronika.jpg`
];

export const MALE_AVATARS = [
  `${avatarsURL}/daniel.jpg`,
  `${avatarsURL}/matt.jpg`,
  `${avatarsURL}/stevie.jpg`,
  `${avatarsURL}/elliot.jpg`,
  `${avatarsURL}/matthew.png`,
  `${avatarsURL}/steve.jpg`
];

export const FEMALE_AVATARS = [
  `${avatarsURL}/elyse.png`,
  `${avatarsURL}/jenny.jpg`,
  `${avatarsURL}/molly.png`,
  `${avatarsURL}/helen.jpg`,
  `${avatarsURL}/kristy.png`,
  `${avatarsURL}/veronika.jpg`
];

export function getRandomAvatar() {
  return AVATARS[Math.floor(Math.random() * AVATARS.length)];
}

export function getDefaultQuery(mixin: Partial<Query> = {}): Query {
  return { pageIndex: 0, pageSize: 5, ...mixin };
}

export const PAGE_SIZE_OPTIONS = [5, 10, 25, 100];
