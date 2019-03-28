import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { RequestOptionsArgs } from '../classes/request-options-args.interface';
import { isNullOrUndefined } from 'util';

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
    return (data: any) => ({ entity: data.entity || entity, response: data.response });
  }

  static mapToPagedResponse(entriesPropName: string) {
    return (data: any) => {
      if ('result' in data) {
        data = data.result;
      }
      return {
        total: data.total,
        entries: data[entriesPropName]
      };
    };
  }

  constructor(private http: HttpClient) {
  }

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

  patch(url: string, body: any = null, options?: RequestOptionsArgs): Observable<any> {
    return this.http.patch(url, body, options);
  }

}
