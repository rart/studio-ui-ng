import { Actions } from '../enums/actions.enum';
import { User } from '../models/user.model';
import { AppAction } from '../models/app-action';
import {
BulkDeletePayload,
CreateUserPayload,
DeletePayload,
FetchUserPayload,
FetchUsersPayload
} from '../models/service-payloads';
import { Query } from '../models/query';
import { getDefaultQuery } from '../app.utils';

export function login(user: User): AppAction {
  return { type: Actions.LOGIN, payload: { user } };
}

export function loginComplete(user: User): AppAction {
  return { type: Actions.LOGGED_IN, payload: { user } };
}

export function logout(): AppAction {
  return { type: Actions.LOGOUT };
}

export function logoutComplete(): AppAction {
  return { type: Actions.LOGGED_OUT };
}

export function timeout(): AppAction {
  return { type: Actions.SESSION_TIMEOUT };
}

export function recover(user: User): AppAction {
  return { type: Actions.RECOVER_PASSWORD, payload: { user } };
}

export function recoverComplete(user: User): AppAction {
  return { type: Actions.RECOVER_PASSWORD, payload: { user } };
}

export function createUser(user: User): AppAction {
  return {
    type: Actions.CREATE_USER,
    payload: { user }
  };
}

export function createUserComplete(response: CreateUserPayload): AppAction<CreateUserPayload> {
  return {
    type: Actions.CREATE_USER_COMPLETE,
    payload: response
  };
}

export function updateUser(user: User): AppAction {
  return {
    type: Actions.UPDATE_USER,
    payload: { user }
  };
}

export function updateUserComplete(response: CreateUserPayload): AppAction<CreateUserPayload> {
  return {
    type: Actions.UPDATE_USER_COMPLETE,
    payload: response
  };
}

export function deleteUser(idOrUsername: string | number) {
  return {
    type: Actions.DELETE_USER,
    payload: { id: idOrUsername }
  };
}

export function deleteUserComplete(response: DeletePayload | BulkDeletePayload) {
  return {
    type: Actions.DELETE_USER_COMPLETE,
    payload: response
  };
}

export function fetchUser(idOrUsername: string | number): AppAction<{ id: string | number }> {
  return {
    type: Actions.FETCH_USER,
    payload: { id: idOrUsername }
  };
}

export function fetchUserComplete(response: FetchUserPayload): AppAction<FetchUserPayload> {
  return {
    type: Actions.FETCH_USER_COMPLETE,
    payload: response
  };
}

export function fetchUsers(query: Query = getDefaultQuery(), forceUpdate: boolean = false): AppAction {
  return {
    type: Actions.FETCH_USERS,
    payload: { query, forceUpdate }
  };
}

export function fetchUsersComplete(response: FetchUsersPayload): AppAction<FetchUsersPayload> {
  return {
    type: Actions.FETCH_USERS_COMPLETE,
    payload: response
  };
}
