
import {Observable} from 'rxjs/Observable';
import 'rxjs/add/operator/toPromise';
import 'rxjs/add/operator/map';
import {Http} from '@angular/http';
import {MatDialog, MatDialogConfig, MatDialogRef, MatSnackBar} from '@angular/material';
import {ComponentType} from "@angular/cdk/portal";
import {TemplateRef} from "@angular/core";

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

export const fetchObservable = (http: Http, path: string, paramMap?): Observable<any> => {
  let parameters = new URLSearchParams();
  for (let key in paramMap) {
    if (paramMap.hasOwnProperty(key)) {
      parameters.set(key, paramMap[key]);
    }
  }
  return http
    .get(path, { search: parameters.toString() })
    .map((response) => response.json());
};

export const fetchPromise = (http: Http, path: string, paramMap?): Promise<any> => {
  return fetchObservable(http, path, paramMap)
    .toPromise()
    .catch((error) => {
      console.log(`An error occurred fetching (${path})`, error);
    });
};

const randomStr = (): string => Math.random().toString(36).slice(2);
export const password = () =>  `${randomStr().substr(5)}-${randomStr().substr(5)}-${randomStr().substr(5)}`;

const S4 = ()  => (( ( (1 + Math.random()) * 0x10000 ) | 0 ).toString(16).substring(1));
export const guid = () => (
  (S4() + S4() + '-' + S4() + '-4' + S4().substr(0, 3) + '-' + S4() + '-' + S4() + S4() + S4())
    .toLowerCase()
);
