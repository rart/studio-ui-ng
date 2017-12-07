import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs/Observable';
import { RequestOptionsArgs } from '../classes/request-options-args.interface';
import { isNullOrUndefined } from 'util';
import { HttpHandler } from '@angular/common/http/src/backend';
import { CookieService } from 'ngx-cookie-service';
import { HttpParams } from '@angular/common/http/src/params';
import { HttpEvent } from '@angular/common/http/src/response';

// export const mapToPostResponse = (entity) => {
//   return (res: any) => ({ entity: entity, responseCode: res.message });
// };

// export const mapToPagedResponse = (entriesPropName: string, EntityClass: { fromJSON: Function }) => {
//   return (data: any) => ({
//     total: data.total,
//     entries: data[entriesPropName].map(entityJSON => EntityClass.fromJSON(entityJSON))
//   });
// };

function params(options: RequestOptionsArgs, paramMap: any): RequestOptionsArgs {
  if (!isNullOrUndefined(paramMap)) {
    if (isNullOrUndefined(options)) {
      options = {};
    }
    options.params = paramMap;
  }
  return options;
}

@Injectable()
export class StudioHttpService /* extends HttpClient */ {

  static mapToPostResponse(entity) {
    return (res: any) => ({ entity: entity, responseCode: res.message });
  }

  static mapToPagedResponse(entriesPropName: string, EntityClass: { fromJSON: Function }) {
    return (data: any) => ({
      total: data.total,
      entries: data[entriesPropName].map(entityJSON => EntityClass.fromJSON(entityJSON))
    });
  }

  constructor(private http: HttpClient) { }

  // constructor(handler: HttpHandler) {
  //   super(handler);
  // }

  // get(url: string, options: {
  //   headers?: HttpHeaders | {
  //     [header: string]: string | string[];
  //   };
  //   observe: 'events';
  //   params?: HttpParams | {
  //     [param: string]: string | string[];
  //   };
  //   reportProgress?: boolean;
  //   responseType?: 'json';
  //   withCredentials?: boolean;
  // }): Observable<HttpEvent<Object>>;

  // get(url: string, options?: {
  //   headers?: HttpHeaders | {
  //     [header: string]: string | string[];
  //   };
  //   observe?: 'body';
  //   params?: HttpParams | {
  //     [param: string]: string | string[];
  //   };
  //   reportProgress?: boolean;
  //   responseType?: 'json';
  //   withCredentials?: boolean;
  // }): Observable<Object> {
  //   return super.get(url, options);
  // }

  get(url: string, paramMap?, options?: RequestOptionsArgs): Observable<any> {
    return this.http.get(url, params(options, paramMap));
  }

  post(url: string, body: any = null, options?: RequestOptionsArgs): Observable<any> {
    return this.http.post(url, body, options);
  }

  put(url: string, body: any = null, options: RequestOptionsArgs): Observable<any> {
    return this.http.put(url, body, options);
  }

  delete(url: string, paramMap?, options?: RequestOptionsArgs): Observable<any> {
    return this.http.delete(url, params(options, paramMap));
  }

}
