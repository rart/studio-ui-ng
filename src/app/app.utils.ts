
import {Observable} from 'rxjs/Observable';
import 'rxjs/add/operator/toPromise';
import 'rxjs/add/operator/map';
import {Http, RequestOptionsArgs} from '@angular/http';
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

export const httpGet = (http: Http, path: string, paramMap?,
                        asPromise = false,
                        options?: RequestOptionsArgs): Observable<any> | Promise<any> => {
  let requestOptions: RequestOptionsArgs = Object.assign(
    {}, paramMap ? { params: paramMap } : {},
    options || {});
  let request = http
    .get(path, requestOptions)
    .map((response) => response.json());
  return asPromise ? request.toPromise() : request;
};

export const httpPost = (http: Http, path: string, body,
                         asPromise = false,
                         options?: RequestOptionsArgs): Observable<any> | Promise<any> => {
  let request = http.post(path, body, options)
    .map(resp => resp.json());
  return (asPromise)
    ? request.toPromise()
    : request;
};

/** @deprecated */
export const fetchObservable = (http: Http, path: string, paramMap?): Observable<any> => {
  let parameters = toURLSearchParams(paramMap);
  return http
    .get(path, { search: parameters.toString() })
    .map((response) => response.json());
};

/** @deprecated */
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
