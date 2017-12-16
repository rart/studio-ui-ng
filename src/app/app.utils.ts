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
   filter$ = Observable.of(''),
   filterFn = (item, query) => true,
   takeUntilOp = takeUntil(Observable.never()),

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

export const asAnonymousSubscription = (unsubscribe: () => void): AnonymousSubscription => {
  return { unsubscribe: unsubscribe };
};

// Avatars from semantic-ui.com
// https://semantic-ui.com/images/avatar2/large/kristy.png
// https://semantic-ui.com/images/avatar/large/elliot.jpg
// https://semantic-ui.com/images/avatar/large/jenny.jpg
// https://semantic-ui.com/images/avatar2/large/matthew.png
// https://semantic-ui.com/images/avatar2/large/molly.png
// https://semantic-ui.com/images/avatar2/large/elyse.png
// https://semantic-ui.com/images/avatar/large/steve.jpg
// https://semantic-ui.com/images/avatar/large/daniel.jpg
// https://semantic-ui.com/images/avatar/large/helen.jpg
// https://semantic-ui.com/images/avatar/large/matt.jpg
// https://semantic-ui.com/images/avatar/large/veronika.jpg
// https://semantic-ui.com/images/avatar/large/stevie.jpg

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

