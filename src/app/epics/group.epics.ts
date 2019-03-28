import { RootEpic } from './root.epic';
import { Actions } from '../enums/actions.enum';
import { Injectable } from '@angular/core';
import { BaseEpic } from './base-epic';
import { GroupService } from '../services/group.service';
import { map } from 'rxjs/operators';
import {
  addGroupMemberComplete, addGroupMembersComplete,
  createGroupComplete,
  deleteGroupComplete, deleteGroupMemberComplete, deleteGroupMembersComplete,
  fetchGroupComplete, fetchGroupMembersComplete,
  fetchGroupsComplete,
  updateGroupComplete
} from '../actions/group.actions';
import { AppState } from '../classes/app-state.interface';
import { Store } from 'redux';
import { isNullOrUndefined } from 'util';
import { NEVER } from 'rxjs';
import { StateObservable } from 'redux-observable';

@Injectable()
export class GroupEpics extends BaseEpic {

  constructor(private service: GroupService) {
    super();
  }

  private create = RootEpic.createEpic(
    Actions.CREATE_GROUP,
    ({ payload }) => this.service.create(payload.group).pipe(
      map(createGroupComplete)
    ));

  private update = RootEpic.createEpic(
    Actions.UPDATE_GROUP,
    ({ payload }) => this.service.update(payload.group).pipe(
      map(updateGroupComplete)
    ));

  private delete = RootEpic.createEpic(
    Actions.DELETE_GROUP,
    ({ payload }) => this.service.delete(payload.id).pipe(
      map(deleteGroupComplete)
    ));

  private fetchGroup = RootEpic.createEpic(
    Actions.FETCH_GROUP,
    ({ payload }) => this.service.byId(payload.id).pipe(
      map(fetchGroupComplete)
    ));

  private fetchGroups = RootEpic.createEpic(
    Actions.FETCH_GROUPS,
    ({ payload }, { value: state }: StateObservable<AppState>) => {
      return (
        (payload.forceUpdate || isNullOrUndefined(state.groupsList.page[payload.query.pageIndex]))
          ? this.service.page(payload.query).pipe(map(fetchGroupsComplete))
          : NEVER
      );
    });

  private fetchGroupMembers = RootEpic.createEpic(
    Actions.FETCH_GROUP_MEMBERS,
    ({ payload }) => this.service.members(payload.id).pipe(
      map(fetchGroupMembersComplete)
    ));

  private addGroupMember = RootEpic.createEpic(
    Actions.ADD_GROUP_MEMBER,
    ({ payload }) => this.service.addMember(payload.id, payload.username).pipe(
      map(addGroupMemberComplete)
    ), false);

  private addGroupMembers = RootEpic.createEpic(
    Actions.ADD_GROUP_MEMBERS,
    ({ payload }) => this.service.addMembers(payload.id, payload.usernames).pipe(
      map(addGroupMembersComplete)
    ));

  private deleteGroupMember = RootEpic.createEpic(
    Actions.DELETE_GROUP_MEMBER,
    ({ payload }) => this.service.deleteMember(payload.id, payload.username).pipe(
      map(deleteGroupMemberComplete)
    ), false);

  private deleteGroupMembers = RootEpic.createEpic(
    Actions.DELETE_GROUP_MEMBERS,
    ({ payload }) => this.service.deleteMembers(payload.id, payload.usernames).pipe(
      map(deleteGroupMembersComplete)
    ));

  protected manifest: string[] = [
    'create',
    'update',
    'delete',
    'fetchGroup',
    'fetchGroups',
    'fetchGroupMembers',
    'addGroupMember',
    'addGroupMembers',
    'deleteGroupMember',
    'deleteGroupMembers'
  ];

}
