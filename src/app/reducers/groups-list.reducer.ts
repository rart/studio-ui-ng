import { Reducer } from 'redux';
import { Actions } from '../enums/actions.enum';
import { ListingViewState } from '../classes/app-state.interface';
import { FetchGroupsPayload } from '../models/service-payloads';
import { AppAction } from '../models/app-action';
import { createKey } from '../utils/state.utils';
import { getDefaultListingViewState, getDefaultQuery } from '../app.utils';
import { isNullOrUndefined } from 'util';

export const groupsList: Reducer<ListingViewState> = (
  state = getDefaultListingViewState(),
  action: AppAction<any>
) => {
  const payload = action.payload;
  switch (action.type) {
    case Actions.FETCH_GROUPS: {
      const nextPage = (
        (state.query.pageSize !== payload.query.pageSize) ||
        (payload.forceUpdate)
      ) ? {} : state.page;
      return {
        ...state,
        query: payload.query,
        // If page size changed, the cached pages are no longer applicable.
        page: nextPage,
        loading: (isNullOrUndefined(nextPage[payload.query.pageIndex])) ? {
          ...state.loading,
          PAGE: true,
          [createKey('PAGE', payload.query.pageIndex)]: true
        } : state.loading
      };
    }
    case Actions.FETCH_GROUPS_COMPLETE: {
      const data = <FetchGroupsPayload>payload;
      return {
        ...state,
        total: data.total,
        page: {
          ...state.page,
          [data.pageIndex]: data.groups.map(g => g.id)
        },
        loading: {
          ...state.loading,
          PAGE: false,
          [createKey('PAGE', data.pageIndex)]: false
        }
      };
    }
    default:
      return state;
  }
};
