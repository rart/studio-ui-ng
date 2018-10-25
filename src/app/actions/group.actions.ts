import { AppAction } from '../models/app-action';
import { Actions } from '../enums/actions.enum';
import { Group } from '../models/group.model';
import {
  CreateGroupPayload,
  DeletePayload,
  FetchGroupPayload,
  FetchGroupsPayload,
  FetchGroupUsersPayload
} from '../models/service-payloads';

export function createGroup(group: Group): AppAction {
  return {
    type: Actions.CREATE_GROUP,
    payload: { group }
  };
}

export function createGroupComplete(response: CreateGroupPayload): AppAction {
  return {
    type: Actions.CREATE_GROUP_COMPLETE,
    payload: response
  };
}

export function updateGroup(group: Group): AppAction {
  return {
    type: Actions.UPDATE_GROUP,
    payload: { group }
  };
}

export function updateGroupComplete(response: CreateGroupPayload): AppAction {
  return {
    type: Actions.UPDATE_GROUP_COMPLETE,
    payload: response
  };
}

export function deleteGroup(id: number): AppAction {
  return {
    type: Actions.DELETE_GROUP,
    payload: { id }
  };
}

export function deleteGroupComplete(response: DeletePayload): AppAction {
  return {
    type: Actions.DELETE_GROUP_COMPLETE,
    payload: response
  };
}

export function fetchGroup(id: number): AppAction {
  return {
    type: Actions.FETCH_GROUP,
    payload: { id }
  };
}

export function fetchGroupComplete(response: FetchGroupPayload): AppAction {
  return {
    type: Actions.FETCH_GROUP_COMPLETE,
    payload: response
  };
}

export function fetchGroups(query: Object): AppAction {
  return {
    type: Actions.FETCH_GROUPS,
    payload: { query }
  };
}

export function fetchGroupsComplete(response: FetchGroupsPayload): AppAction {
  return {
    type: Actions.FETCH_GROUPS_COMPLETE,
    payload: response
  };
}

export function fetchGroupMembers(id: number): AppAction {
  return {
    type: Actions.FETCH_GROUP_MEMBERS,
    payload: { id }
  };
}

export function fetchGroupMembersComplete(response: FetchGroupUsersPayload): AppAction<FetchGroupUsersPayload> {
  return {
    type: Actions.FETCH_GROUP_MEMBERS_COMPLETE,
    payload: response
  };
}

export function addGroupMember(groupId: number, username: string): AppAction {
  return {
    type: Actions.ADD_GROUP_MEMBER,
    payload: { id: groupId, username }
  };
}

export function addGroupMemberComplete(response: FetchGroupUsersPayload): AppAction {
  return {
    type: Actions.ADD_GROUP_MEMBER_COMPLETE,
    payload: response
  };
}

export function addGroupMembers(groupId: number, usernames: string[]): AppAction {
  return {
    type: Actions.ADD_GROUP_MEMBERS,
    payload: { id: groupId, usernames }
  };
}

export function addGroupMembersComplete(response: FetchGroupUsersPayload): AppAction {
  return {
    type: Actions.ADD_GROUP_MEMBERS_COMPLETE,
    payload: response
  };
}

export function deleteGroupMember(groupId: number, username: string): AppAction {
  return {
    type: Actions.DELETE_GROUP_MEMBER,
    payload: { id: groupId, username }
  };
}

export function deleteGroupMemberComplete(response: FetchGroupUsersPayload): AppAction {
  return {
    type: Actions.DELETE_GROUP_MEMBER_COMPLETE,
    payload: response
  };
}

export function deleteGroupMembers(groupId: number, usernames: string[]): AppAction {
  return {
    type: Actions.DELETE_GROUP_MEMBERS,
    payload: { id: groupId, usernames }
  };
}

export function deleteGroupMembersComplete(response: FetchGroupUsersPayload): AppAction {
  return {
    type: Actions.DELETE_GROUP_MEMBERS_COMPLETE,
    payload: response
  };
}
