import { Reducer } from 'redux';
import { Actions } from '../enums/actions.enum';
import { ListingViewState } from '../classes/app-state.interface';
import { FetchUsersPayload } from '../models/service-payloads';
import { AppAction } from '../models/app-action';

const DEFAULT_STATE: ListingViewState = {
  total: 0,
  order: [],
  page: {},
  query: {}
};

export const usersList: Reducer<ListingViewState> = (state = DEFAULT_STATE, action: AppAction<any>) => {
  const payload = action.payload;
  switch (action.type) {
    case Actions.FETCH_USERS:
      return {
        ...state,
        query: payload.query
      };
    case Actions.FETCH_USERS_COMPLETE: {
      const data: FetchUsersPayload = payload;
      return {
        ...state,
        total: data.total
      };
    }
    default:
      return state;
  }
};
