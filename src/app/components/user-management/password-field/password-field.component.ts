import {Component, Input, OnInit} from '@angular/core';
import {FormControl, Validators} from '@angular/forms';
import { StringUtils } from '../../../utils/string.utils';

const TYPE_TEXT = 'text';
const TYPE_PASSWORD = 'password';

@Component({
  selector: 'std-password-field',
  template: `
    <mat-form-field>
      <input placeholder="Password" i18n-placeholder
             matInput [type]="passwordInputType"
             [formControl]="formControlRef"
             [(ngModel)]="model.password">
      <mat-error i18n *ngIf="formControlRef.hasError('required')">
        Password is <strong>required</strong>
      </mat-error>
    </mat-form-field>
    <button class="ui basic icon mini button"
            *ngIf="allowVisibilityControl"
            (click)="togglePasswordVisibility()"
            title="Show/Hide Password" i18n-title>
      <i class="icon {{passwordInputType === 'text' ? 'low vision' : 'eye'}}"></i>
    </button>
    <button i18n class="ui basic mini button" *ngIf="allowGeneration" (click)="generatePassword()">
      Generate
    </button>`
}) export class PasswordFieldComponent implements OnInit {
  @Input() model;
  @Input() autoGenerate = false;
  @Input() allowVisibilityControl = true;
  @Input() allowGeneration = true;
  @Input() formControlRef;
  passwordInputType = TYPE_TEXT;
  ngOnInit() {
    if (!this.formControlRef) {
      this.formControlRef = new FormControl('', [Validators.required]);
    }
    if (this.autoGenerate) {
      this.generatePassword();
    }
  }
  generatePassword() {
    const passwd: string = StringUtils.password();
    this.formControlRef.setValue(passwd);
    this.model.password = passwd;
  }
  togglePasswordVisibility() {
    if (this.passwordInputType === TYPE_PASSWORD) {
      this.passwordInputType = TYPE_TEXT;
    } else if (this.passwordInputType === TYPE_TEXT) {
      this.passwordInputType = TYPE_PASSWORD;
    }
  }
}
