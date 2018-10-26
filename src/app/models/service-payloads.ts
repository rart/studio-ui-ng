import { User } from './user.model';
import { Group } from './group.model';

export interface APIResponse {
  code: number;
  message: string;
  remedialAction: string;
  documentationURL: string;
}

export interface APIResponsePayload {
  response: APIResponse;
}

export interface DeletePayload {
  id: number | string;
  response: APIResponse;
}

export interface BulkDeletePayload {
  ids: Array<number | string>;
  response: APIResponse;
}

export interface PagedPayload {
  total: number;
  pageSize: number;
  pageIndex: number;
}

export interface BasicUsersPayload {
  users: User[];
  response: APIResponse;
}

export interface FetchUsersPayload extends BasicUsersPayload, PagedPayload {

}

export interface FetchUserPayload {
  id: number | string;
  user: User;
  response: APIResponse;
}

export interface CreateUserPayload {
  user: User;
  response: APIResponse;
}

export interface CreateGroupPayload {
  group: Group;
  response: APIResponse;
}

export interface BasicGroupsPayload {
  groups: Group[];
  response: APIResponse;
}

export interface FetchGroupsPayload extends PagedPayload, BasicGroupsPayload {

}

export interface FetchGroupPayload {
  id: number;
  group: Group;
  response: APIResponse;
}

export interface FetchGroupUsersPayload extends APIResponsePayload {
  id: number;
  users: User[];
}
