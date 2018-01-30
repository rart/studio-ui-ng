import { AnyAction, Reducer } from 'redux';

import { StoreActionsEnum } from '../enums/actions.enum';
import { StateEntity } from '../classes/app-state.interface';
import { Project } from '../models/project.model';
import { createEntityState, createLookupTable } from '../utils/state.utils';

export const projects: Reducer<StateEntity<Project>> =
  (state = createEntityState({}), action: AnyAction): StateEntity<Project> => {
    switch (action.type) {

      case StoreActionsEnum.FETCH_PROJECTS:
        return createEntityState({
          loading: { all: true },
          byId: state.byId
        });

      case StoreActionsEnum.PROJECTS_FETCHED:
        return createEntityState({
          byId: createLookupTable(action.projects, 'code')
        });

      case StoreActionsEnum.PROJECTS_FETCH_ERROR:
        return {
          ...state,
          error: { ...state.error, all: new Error('') }
        };

      case StoreActionsEnum.FETCH_PROJECT:
        return state;

      case StoreActionsEnum.CREATE_PROJECT:
        return state;

      case StoreActionsEnum.UPDATE_PROJECT:
        return state;

      case StoreActionsEnum.DELETE_PROJECT:
        return state;

      case StoreActionsEnum.PROJECT_CREATED:
        return state;

      case StoreActionsEnum.PROJECT_UPDATED:
        return state;

      case StoreActionsEnum.PROJECT_DELETED:
        return state;

      default:
        return state;

    }
  };
