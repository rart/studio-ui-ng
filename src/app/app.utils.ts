
import 'rxjs/add/operator/toPromise';
import 'rxjs/add/operator/map';
import {MatDialog, MatDialogConfig, MatDialogRef, MatSnackBar} from '@angular/material';
import {ComponentType} from '@angular/cdk/portal';
import {TemplateRef} from '@angular/core';

// MatSnackBarHorizontalPosition = 'start' | 'center' | 'end' | 'left' | 'right';
// MatSnackBarVerticalPosition = 'top' | 'bottom';
export const showSnackBar = (snackBarModule: MatSnackBar, message: string, action?, options?) => {
  let opts = Object.assign({
    horizontalPosition: 'center',
    verticalPosition: 'top',
    duration: 6000
  }, options || {});
  return snackBarModule.open(message, action, opts);
};

export const openDialog = <T>(
  dialogModule: MatDialog,
  compOrTemplate: ComponentType<T> | TemplateRef<T>,
  config?: MatDialogConfig): MatDialogRef<T> => {
  return dialogModule.open(compOrTemplate, config);
};

export const toURLSearchParams = (paramMap = {}) => {
  let parameters = new URLSearchParams();
  Object.keys(paramMap).forEach((key) => parameters.set(key, paramMap[key]));
  return parameters;
};

const randomStr = (): string => Math.random().toString(36).slice(2);
export const password = () =>  `${randomStr().substr(5)}-${randomStr().substr(5)}-${randomStr().substr(5)}`;

// taken from TodoMVC
export const uuid = () => {
  let i, random;
  let result = '';

  for (i = 0; i < 32; i++) {
    random = Math.random() * 16 | 0;
    if (i === 8 || i === 12 || i === 16 || i === 20) {
      result += '-';
    }
    result += (i === 12 ? 4 : (i === 16 ? (random & 3 | 8) : random))
      .toString(16);
  }

  return result;
}

export class StringUtils {
  static contains(str, search) {
    return str.indexOf(search) !== -1;
  }
  static remove(str, remove) {
    return str.replace(remove, '');
  }
}
