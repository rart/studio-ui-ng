import { Reducer } from 'redux';
import { Actions } from '../enums/actions.enum';
import { ListingViewState } from '../classes/app-state.interface';
import { FetchUsersPayload } from '../models/service-payloads';
import { AppAction } from '../models/app-action';
import { createKey } from '../utils/state.utils';
import { getDefaultQuery } from '../app.utils';
import { isNullOrUndefined } from 'util';

const DEFAULT_STATE: ListingViewState = {
  total: 0,
  order: [],
  page: {},
  loading: {},
  query: getDefaultQuery()
};

export const usersList: Reducer<ListingViewState> = (state = DEFAULT_STATE, action: AppAction<any>) => {
  const payload = action.payload;
  switch (action.type) {
    case Actions.FETCH_USERS: {
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
    case Actions.FETCH_USERS_COMPLETE: {
      const data = <FetchUsersPayload>payload;
      return {
        ...state,
        total: data.total,
        page: {
          ...state.page,
          [data.pageIndex]: data.users.map(u => u.username)
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
