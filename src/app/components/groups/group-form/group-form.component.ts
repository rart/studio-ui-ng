import { Component, OnInit } from '@angular/core';
import { dispatch, NgRedux } from '@angular-redux/store';
import {
  addGroupMember,
  createGroup,
  deleteGroup,
  deleteGroupMember,
  fetchGroup,
  fetchGroupMembers,
  updateGroup
} from '../../../actions/group.actions';
import { AppState, GroupState, LookupTable, ModelState, ResultEntry } from '../../../classes/app-state.interface';
import { ActivatedRoute, Router } from '@angular/router';
import { filter } from 'rxjs/operators';
import { WithNgRedux } from '../../../classes/with-ng-redux.class';
import { Actions } from '../../../enums/actions.enum';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { clearActionResult } from '../../../actions/app.actions';
import { Group } from '../../../models/group.model';
import { APIResponse } from '../../../models/service-payloads';
import { isSuccessResponse, notNullOrUndefined } from '../../../app.utils';
import { createCompoundKey } from '../../../utils/state.utils';
import { MatSnackBar } from '@angular/material';
import { showSnackBar } from '../../../utils/material.utils';
import { User } from '../../../models/user.model';
import { fetchUsers } from '../../../actions/user.actions';
import { combineLatest } from 'rxjs/observable/combineLatest';

@Component({
  selector: 'std-groups-form',
  templateUrl: './group-form.component.html',
  styleUrls: ['./group-form.component.scss']
})
export class GroupFormComponent extends WithNgRedux implements OnInit {

  users: User[] = [];
  members: User[] = [];
  memberIds: string[] = [];
  addingMembers: LookupTable<boolean> = { };
  deletingMembers: LookupTable<boolean> = {};

  editMode = false;
  editModeId: number = null;
  loading: boolean = false;
  loadingMessage: string = '';
  loadingMembers: boolean;
  loadingUsers: boolean;

  groupForm: FormGroup = new FormGroup({
    id: new FormControl(''),
    name: new FormControl('', [Validators.required]),
    description: new FormControl('')
  });

  constructor(store: NgRedux<AppState>,
              private route: ActivatedRoute,
              private snackBar: MatSnackBar,
              private router: Router) {
    super(store);
  }

  ngOnInit() {
    const { route, store } = this;

    route.params
      .pipe(filter(params => notNullOrUndefined(params.id)))
      .subscribe((params) => {
        this.editMode = true;
        this.editModeId = params.id;
        this.fetchGroup(params.id);
      });

    store.select(['entities', 'groups'])
      .pipe(this.untilDestroyed())
      .subscribe((groups: ModelState<Group>) => {
        this.loadingStateChanged(groups.loading);
        this.resultsStateChanged(groups.results);
        this.byIdStateChanged(groups.byId); // Depends on results changed to swich to editMode
      });

  }

  private loadingStateChanged(loading: LookupTable<boolean>) {
    const
      { groupForm, editModeId: id } = this,
      name = groupForm.controls.name.value,
      fetching = !!loading[id],
      creating = !!loading[createCompoundKey(Actions.CREATE_GROUP, name)],
      updating = !!loading[createCompoundKey(Actions.UPDATE_GROUP, id)],
      deleting = !!loading[createCompoundKey(Actions.DELETE_GROUP, id)];
    this.loading = (fetching || creating || updating || deleting);
    if (fetching) {
      this.loadingMessage = 'RETRIEVING_GROUP_INFORMATION';
    } else if (creating) {
      this.loadingMessage = 'CREATING_GROUP';
    } else if (updating) {
      this.loadingMessage = 'UPDATING_GROUP';
    } else if (deleting) {
      this.loadingMessage = 'DELETING_GROUP';
    } else {
      this.loadingMessage = '';
    }
  }

  private byIdStateChanged(byId: LookupTable<Group>) {
    const { editMode, editModeId } = this;
    if (editMode && byId[editModeId]) {
      this.groupForm.patchValue(byId[editModeId]);
    }
  }

  private resultsStateChanged(results: LookupTable<ResultEntry>) {

    const
      { groupForm, editModeId: id } = this,
      name = groupForm.controls.name.value;

    let
      key: string,
      response: APIResponse,
      isCreate = false;

    if (notNullOrUndefined(results[key = createCompoundKey(Actions.CREATE_GROUP, name)])) {
      isCreate = true;
      this.editMode = true;
      this.editModeId = results[key].group.id;
    }

    if (notNullOrUndefined(results[key = createCompoundKey(Actions.DELETE_GROUP, id)])) {
      this.router.navigate(['/groups']);
    }

    if (
      notNullOrUndefined(results[key = createCompoundKey(Actions.CREATE_GROUP, name)]) ||
      notNullOrUndefined(results[key = createCompoundKey(Actions.UPDATE_GROUP, id)]) ||
      notNullOrUndefined(results[key = createCompoundKey(Actions.DELETE_GROUP, id)])
    ) {
      response = results[key].response;
      if (isSuccessResponse(response)) {
        showSnackBar(this.snackBar, `${response.message}.${isCreate ? ' Switched to edit mode.' : ''}`);
        this.clearResult(key);
      }
    }

  }

  selectedTabChange(index) {
    if (index === 1) {
      const { store } = this;
      this.fetchUsers();
      this.fetchGroupMembers();
      combineLatest(
        store.select(['entities', 'groups']),
        store.select(['entities', 'users']))
        .pipe(this.untilDestroyed())
        .subscribe((values: any[]) => {

          const
            { editModeId: id, addingMembers, deletingMembers } = this,
            groups: GroupState = values[0],
            users: ModelState<User> = values[1],
            members = (groups.members[id] || []).concat();

          this.users = Object.values(users.byId).filter(u => !members.includes(u.username));
          this.members = members.filter(i => i in users.byId).map(i => users.byId[i]);
          this.memberIds = members;

          this.loadingMembers = !!groups.loading[createCompoundKey(Actions.FETCH_GROUP_MEMBERS, id)];
          this.loadingUsers = !!users.loading.PAGE;

          Object.keys(addingMembers)
            .forEach((username) => {
              addingMembers[username] = !!groups.loading[createCompoundKey(Actions.ADD_GROUP_MEMBER, id, username)];
            });

          Object.keys(deletingMembers)
            .forEach((username) => {
              deletingMembers[username] = !!groups.loading[createCompoundKey(Actions.DELETE_GROUP_MEMBER, id, username)];
            });

        });
    }
  }

  @dispatch()
  fetchGroup(id: number) {
    return fetchGroup(id);
  }

  @dispatch()
  fetchUsers() {
    return fetchUsers();
  }

  @dispatch()
  fetchGroupMembers() {
    return fetchGroupMembers(this.editModeId);
  }

  @dispatch()
  create() {
    return createGroup(this.groupForm.value);
  }

  @dispatch()
  update() {
    return updateGroup(this.groupForm.value);
  }

  @dispatch()
  eliminate() {
    return deleteGroup(this.groupForm.value.id);
  }

  @dispatch()
  clearResult(key: string) {
    return clearActionResult(key);
  }

  @dispatch()
  addMember(user: User) {
    this.addingMembers[user.username] = true;
    return addGroupMember(this.editModeId, user.username);
  }

  @dispatch()
  deleteMember(user: User) {
    this.deletingMembers[user.username] = true;
    return deleteGroupMember(this.editModeId, user.username);
  }

}
