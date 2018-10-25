import { Reducer } from 'redux';
import { Actions } from '../enums/actions.enum';
import { User } from '../models/user.model';
import { ModelState } from '../classes/app-state.interface';
import { FetchUserPayload, FetchUsersPayload } from '../models/service-payloads';
import { AppAction } from '../models/app-action';
import { popActionResult, createLookupTable, createCompoundKey } from '../utils/state.utils';
import { getDefaultModelState, isSuccessResponse } from '../app.utils';

export const users: Reducer<ModelState<User>> = (state = getDefaultModelState(), action: AppAction) => {
  const payload = action.payload;
  switch (action.type) {
    case Actions.CLEAR_ACTION_RESULT:
      return popActionResult(state, payload.key);
    case Actions.UPDATE_USER:
    case Actions.CREATE_USER: {
      const
        { user } = payload,
        operation = createCompoundKey(action.type, user.username);
      return {
        ...state,
        loading: {
          ...state.loading,
          [operation]: true
        }
      };
    }
    case Actions.CREATE_USER_COMPLETE:
    case Actions.UPDATE_USER_COMPLETE: {
      const
        { user } = payload,
        operation = createCompoundKey(action.type.replace('_COMPLETE', ''), user.username);
      return {
        ...state,
        byId: {
          ...state.byId,
          [user.username]: user
        },
        loading: {
          ...state.loading,
          [operation]: false
        },
        results: {
          ...state.results,
          [operation]: payload
        }
      };
    }
    case Actions.DELETE_USER: {
      const operation = createCompoundKey(action.type, payload.id);
      return {
        ...state,
        loading: {
          ...state.loading,
          [operation]: true
        }
      };
    }
    case Actions.DELETE_USER_COMPLETE: {
      const nextById = { ...state.byId };
      const operation = createCompoundKey(Actions.DELETE_USER, payload.id);
      delete nextById[payload.id];
      return {
        ...state,
        byId: nextById,
        loading: {
          ...state.loading,
          [operation]: false
        },
        results: {
          ...state.results,
          [operation]: payload
        }
      };
    }
    case Actions.FETCH_USER:
      return {
        ...state,
        loading: {
          ...state.loading,
          [payload.id]: true
        }
      };
    case Actions.FETCH_USER_COMPLETE: {
      const { user, response } = <FetchUserPayload>payload;
      return {
        ...state,
        byId: isSuccessResponse(response) ? {
          ...state.byId,
          [user.username]: user
        } : state.byId,
        loading: {
          ...state.loading,
          [user.username]: false
        },
        results: {
          ...state.results,
          [user.username]: payload
        }
      };
    }
    case Actions.FETCH_USERS:
      return {
        ...state,
        loading: {
          ...state.loading,
          PAGE: true
        }
      };
    case Actions.FETCH_USERS_COMPLETE: {
      const data: FetchUsersPayload = payload;
      return {
        ...state,
        loading: {
          ...state.loading,
          PAGE: false
        },
        byId: {
          ...state.byId,
          ...createLookupTable<User>(data.users, 'username')
        }
      };
    }
    default:
      return state;
  }
};
