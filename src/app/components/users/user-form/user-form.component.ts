import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material';
import { ActivatedRoute, Router } from '@angular/router';
import { User } from '../../../models/user.model';
import { showSnackBar } from '../../../utils/material.utils';
import { Change, ChangeType } from '../../../classes/change-tracker.class';
import { GroupService } from '../../../services/group.service';
import { AVATARS, createEmptyUser, fullName } from '../../../app.utils';
import { Observable } from 'rxjs/Observable';
import { dispatch, NgRedux, select } from '@angular-redux/store';
import { AppState, Settings } from '../../../classes/app-state.interface';
import { createUser, deleteUser, fetchUser, updateUser } from '../../../actions/user.actions';
import { WithNgRedux } from '../../../classes/with-ng-redux.class';
import { Actions } from '../../../enums/actions.enum';

const EMAIL_REGEX = /^[a-zA-Z0-9.!#$%&’*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;

@Component({
  selector: 'std-user-crud',
  templateUrl: './user-form.component.html',
  styleUrls: ['./user-form.component.scss']
})
export class UserFormComponent extends WithNgRedux implements OnInit {

  @Output() finished = new EventEmitter();

  @select('settings')
  settings$: Observable<Settings>;

  avatars = AVATARS;

  userGroupsHasChanges = false;
  groupChangeRollback: Change;

  loading: boolean = false;
  loadingMessage: string = '';
  model: User = createEmptyUser();
  editMode = false;
  editModeId: string;
  selectedTabIndex = 0;
  notifyPasswordReset = true;

  resetPasswordControl = new FormControl('', [Validators.required]);

  userForm = new FormGroup({
    firstName: new FormControl('', [Validators.required]),
    lastName: new FormControl('', [Validators.required]),
    email: new FormControl('', [Validators.required, Validators.pattern(EMAIL_REGEX)]),
    username: new FormControl('', [Validators.required]),
    password: new FormControl('', [Validators.required]),
    enabled: new FormControl(true)
  });

  constructor(public snackBar: MatSnackBar,
              private router: Router,
              private route: ActivatedRoute,
              public groupService: GroupService,
              store: NgRedux<AppState>) {
    super(store);
  }

  ngOnInit() {

    const
      { route, store } = this,
      subscription = (params) => {
        if (params.username || params.edit) {
          this.editMode = true;
          this.editModeId = params.username || params.edit;
          this.userForm.controls.username.disable();
          this.loadUser();
        }
      };

    route.params.subscribe(subscription);
    route.queryParams.subscribe(subscription);

    store.select(['entities', 'users', 'loading'])
      .pipe(this.untilDestroyed())
      .subscribe((loading: any) => {
        const
          { model, editModeId: id } = this,
          fetching = !!loading[id],
          creating = !!loading[`${Actions.CREATE_USER}[${model.username}]`],
          updating = !!loading[`${Actions.UPDATE_USER}[${id}]`],
          deleting = !!loading[`${Actions.DELETE_USER}[${id}]`];
        this.loading = (fetching || creating || updating || deleting);
        if (fetching) {
          this.loadingMessage = 'RETRIEVING_USER_INFORMATION';
        } else if (creating) {
          this.loadingMessage = 'CREATING_USER';
        } else if (updating) {
          this.loadingMessage = 'UPDATING_USER';
        } else if (deleting) {
          this.loadingMessage = 'DELETING_USER';
        } else {
          this.loadingMessage = '';
        }
      });

    store.select(['entities', 'users', 'byId'])
      .pipe(this.untilDestroyed())
      .subscribe((users) => {
        const { editMode, editModeId } = this;
        if (editMode && editModeId && users[editModeId]) {
          this.model = users[editModeId];
          this.userForm.patchValue(users[editModeId]);
          this.userForm.controls.password.setValidators([]);
        } else {
          this.userForm.controls.password.setValidators([Validators.required]);
        }
      });

  }

  done(snackBarMessage?) {

    if (snackBarMessage) {
      showSnackBar(this.snackBar, snackBarMessage);
    }

    // TODO: Better way of doing this?
    // How can parent component view subscribe to the event if it's the router outlet how renders
    // https://stackoverflow.com/questions/38393494/how-to-emit-event-in-router-outlet-in-angular2
    if (this.finished.observers.length) {
      this.finished.emit();
    } else {
      this.router.navigate(['/users']);
    }

  }

  @dispatch()
  loadUser() {
    return fetchUser(this.editModeId);
  }

  // @dispatch()
  create() {
    console.log(this.userForm.getRawValue());
    // return createUser(this.model);
    // showSnackBar(this.snackBar, `${fullName(this.model)} registered successfully. Edit mode enabled.`);
  }

  @dispatch()
  update() {
    return updateUser(this.model);
    // this.done(`${this.fullName()} updated successfully.`);
  }

  @dispatch()
  eliminate() {
    return deleteUser(this.model.username);
  }

  resetPassword() {
    console.log('TODO...');
  }

  userGroupsChanged(data) {
    this.userGroupsHasChanges = data.hasChanges;
    let change = data.change;
    if (ChangeType.Add === change.type) {
      this.addToGroup(change.value.projectCode, change.value.groupName);
    } else /* if (ChangeType.Remove === change.type) */ {
      this.removeFromGroup(change.value.projectCode, change.value.groupName);
    }
  }

  addToGroup(projectCode, groupName) {
    this.groupService
      .addUser({ username: this.model.username, projectCode, groupName })
      .subscribe(() =>
        showSnackBar(this.snackBar, `${fullName(this.model)} added to ${groupName}`, 'Undo', { duration: 10000 })
          .onAction()
          .subscribe(() => {
            this.groupChangeRollback = { type: ChangeType.Add, value: { projectCode, groupName } };
            this.removeFromGroup(projectCode, groupName);
          }));
  }

  removeFromGroup(projectCode, groupName) {
    this.groupService
      .removeUser({ username: this.model.username, projectCode, groupName })
      .subscribe(() =>
        showSnackBar(this.snackBar, `${fullName(this.model)} removed from ${groupName}`, 'Undo', { duration: 10000 })
          .onAction()
          .subscribe(() => {
            this.groupChangeRollback = { type: ChangeType.Remove, value: { projectCode, groupName } };
            this.addToGroup(projectCode, groupName);
          }));
  }

  updateGroups() {
    // TODO: Not supported by API
  }

}
