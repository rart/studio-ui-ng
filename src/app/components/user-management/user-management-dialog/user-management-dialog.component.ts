import {Component, Inject, OnInit} from '@angular/core';
import {FormControl, FormGroup, Validators} from '@angular/forms';
import {MatDialog, MatDialogRef, MAT_DIALOG_DATA, MatSnackBar} from '@angular/material';
import {Router} from '@angular/router';
import {UserService} from '../../../services/user.service';
import {User} from '../../../models/user';
import {password, showSnackBar} from '../../../app.utils';
import {Change, ChangeType} from '../../../classes/ChangeTracker';
import {GroupService} from '../../../services/group.service';

const EMAIL_REGEX = /^[a-zA-Z0-9.!#$%&’*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;
const TYPE_PASSWORD = 'password';
const TYPE_TEXT = 'text';

// @Component({
//   selector: 'std-password-field',
//   template: `
//     <mat-form-field>
//       <input i18n-placeholder placeholder="Password"
//              matInput [type]="passwordInputType"
//              [formControl]="passwordFormControl"
//              [(ngModel)]="model.password">
//       <mat-error i18n *ngIf="passwordFormControl.hasError('required')">
//         Password is <strong>required</strong>
//       </mat-error>
//     </mat-form-field>
//     <button class="ui basic icon mini button" (click)="togglePasswordVisibility()">
//       <i class="icon" class="{{passwordInputType === 'text' ? 'eye' : 'low vision'}}"></i>
//     </button>
//     <button class="ui basic mini button" (click)="generatePassword()">Generate</button>`
// }) class PasswordFieldComponent implements OnInit {
//   @Input() type = TYPE_TEXT;
//   ngOnInit() {
//
//   }
// }

@Component({
  selector: 'std-user-management-dialog',
  templateUrl: './user-management-dialog.component.html',
  styleUrls: ['./user-management-dialog.component.scss']
})
export class UserManagementDialogComponent implements OnInit {

  userGroupsHasChanges = false;
  groupChangeRollback: Change;

  model: User = new User();
  isEnabled = false;
  editMode = false;
  passwordInputType = TYPE_TEXT;
  selectedTabIndex = 0;
  notifyPasswordReset = true;

  firstNameFormControl = new FormControl('', [Validators.required]);
  lastNameFormControl = new FormControl('', [Validators.required]);
  emailFormControl = new FormControl('', [Validators.required, Validators.pattern(EMAIL_REGEX)]);
  userNameFormControl = new FormControl('', [Validators.required]);
  passwordFormControl = new FormControl('', [Validators.required]);

  basicInfoFormGroup = new FormGroup({
    firstName: this.firstNameFormControl,
    lastName: this.lastNameFormControl,
    email: this.emailFormControl,
    userName: this.userNameFormControl,
    password: this.passwordFormControl
  });

  constructor(
    public dialogRef: MatDialogRef<UserManagementDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    public snackBar: MatSnackBar,
    private router: Router,
    public userService: UserService,
    public groupService: GroupService
  ) { }

  ngOnInit() {
    const data = this.data;
    if (data.username) {
      this.model.username = data.username;
      this.loadUser();
    } else {
      this.model.enabled = true;
      this.generatePassword();
    }
  }

  done(snackBarMessage?) {
    this.dialogRef.close();
    if (snackBarMessage) {
      showSnackBar(this.snackBar, snackBarMessage);
    }
    this.router.navigate(['/users']);
  }

  loadUser() {
    const username = this.model.username;
    this.userService.isEnabled(username)
      .then((isEnabled) => {
        this.model.enabled = this.isEnabled = isEnabled;
      });
    return this.userService.fetch(username)
      .then((response) => {
        this.model = response;
        this.model.enabled = this.isEnabled;
        this.editMode = true;
      });
  }

  create() {
    this.userService
      .create(this.model)
      .then((data) => {
        if (data.message === 'OK') {
          showSnackBar(this.snackBar, `${this.fullName()} registered successfully. Edit mode enabled.`);
          this.loadUser();
        }
      });
  }

  update() {
    this.userService
      .update(this.model)
      .then((data) => {
        this.done(`${this.fullName()} updated successfully.`);
      });
  }

  eliminate() {
    this.userService
      .eliminate(this.model)
      .then(() => {
        this.done(`${this.fullName()} deleted successfully.`);
      });
  }

  resetPassword() {
    this.userService
      .resetPassword(this.model)
      .then(() => {
        this.done('Password successfully reset.');
      });
  }

  togglePasswordVisibility() {
    if (this.passwordInputType === TYPE_PASSWORD) {
      this.passwordInputType = TYPE_TEXT;
    } else if (this.passwordInputType === TYPE_TEXT) {
      this.passwordInputType = TYPE_PASSWORD;
    }
  }

  generatePassword() {
    const passwd: string = password();
    this.passwordFormControl.setValue(passwd);
    this.model.password = passwd;
  }

  fullName() {
    return `${this.model.firstName} ${this.model.lastName}`;
  }

  userGroupsChanged(data) {
    this.userGroupsHasChanges = data.hasChanges;
    let change = data.change;
    if (ChangeType.Add === change.type) {
      this.addToGroup(change.value.siteCode, change.value.groupName);
    } else /* if (ChangeType.Remove === change.type) */ {
      this.removeFromGroup(change.value.siteCode, change.value.groupName);
    }
  }

  addToGroup(siteCode, groupName) {
    this.groupService
      .addUser({ username: this.model.username, siteCode, groupName })
      .then(() =>
        showSnackBar(this.snackBar, `${this.fullName()} added to ${groupName}`, 'Undo', { duration: 10000 })
          .onAction()
          .subscribe(() => {
            this.groupChangeRollback = { type: ChangeType.Add, value: {siteCode, groupName} };
            this.removeFromGroup(siteCode, groupName);
          }));
  }

  removeFromGroup(siteCode, groupName) {
    this.groupService
      .removeUser({ username: this.model.username, siteCode, groupName })
      .then(() =>
        showSnackBar(this.snackBar, `${this.fullName()} removed from ${groupName}`, 'Undo', { duration: 10000 })
          .onAction()
          .subscribe(() => {
            this.groupChangeRollback = { type: ChangeType.Remove, value: {siteCode, groupName} };
            this.addToGroup(siteCode, groupName);
          }));
  }

  updateGroups() {
    // TODO: Not supported by API
  }

}
