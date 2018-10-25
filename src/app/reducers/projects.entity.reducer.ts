import { AnyAction, Reducer } from 'redux';

import { Actions } from '../enums/actions.enum';
import { StateEntity } from '../classes/app-state.interface';
import { Project } from '../models/project.model';
import { createEntityState, createLookupTable } from '../utils/state.utils';

export const projects: Reducer<StateEntity<Project>> =
  (state = createEntityState({}), action: AnyAction): StateEntity<Project> => {
    switch (action.type) {

      case Actions.FETCH_PROJECTS:
        return ({
          ...state,
          loading: { ...state.loading, all: true },
          byId: state.byId
        });

      case Actions.PROJECTS_FETCHED:
        return ({
          ...state,
          loading: { ...state.loading, all: false },
          byId: createLookupTable(action.projects, 'code')
        });

      case Actions.PROJECTS_FETCH_ERROR:
        return {
          ...state,
          error: { ...state.error, all: new Error('') }
        };

      case Actions.FETCH_PROJECT:
        return state;

      case Actions.CREATE_PROJECT:
        return state;

      case Actions.UPDATE_PROJECT:
        return state;

      case Actions.DELETE_PROJECT:
        return state;

      case Actions.PROJECT_CREATED:
        return state;

      case Actions.PROJECT_UPDATED:
        return state;

      case Actions.PROJECT_DELETED:
        return state;

      default:
        return state;

    }
  };
