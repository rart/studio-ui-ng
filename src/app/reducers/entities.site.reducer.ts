import { AnyAction, Reducer } from 'redux';

import { StoreActionsEnum } from '../enums/actions.enum';
import { StateEntity } from '../classes/app-state.interface';
import { Site } from '../models/site.model';
import { createEntityState, createLookupTable } from '../utils/state.utils';

export const site: Reducer<StateEntity<Site>> =
  (state = createEntityState({}), action: AnyAction): StateEntity<Site> => {
    switch (action.type) {

      case StoreActionsEnum.FETCH_SITES:
        return createEntityState({
          loading: true,
          byId: state.byId,
          list: state.list
        });

      case StoreActionsEnum.SITES_FETCHED:
        return createEntityState({
          byId: createLookupTable(action.sites, 'code'),
          list: action.sites
        });

      case StoreActionsEnum.SITES_FETCH_ERROR:
        return {
          ...state,
          error: new Error('')
        };

      case StoreActionsEnum.FETCH_SITE:
        return state;

      case StoreActionsEnum.CREATE_SITE:
        return state;

      case StoreActionsEnum.UPDATE_SITE:
        return state;

      case StoreActionsEnum.DELETE_SITE:
        return state;

      case StoreActionsEnum.SITE_CREATED:
        return state;

      case StoreActionsEnum.SITE_UPDATED:
        return state;

      case StoreActionsEnum.SITE_DELETED:
        return state;

      default:
        return state;

    }
  };
