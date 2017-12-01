import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs/Observable';
import { RequestOptionsArgs } from '../classes/request-options-args.interface';

// export const mapToPostResponse = (entity) => {
//   return (res: any) => ({ entity: entity, responseCode: res.message });
// };

// export const mapToPagedResponse = (entriesPropName: string, EntityClass: { fromJSON: Function }) => {
//   return (data: any) => ({
//     total: data.total,
//     entries: data[entriesPropName].map(entityJSON => EntityClass.fromJSON(entityJSON))
//   });
// };

@Injectable()
export class StudioHttpService {

  static mapToPostResponse(entity) {
    return (res: any) => ({ entity: entity, responseCode: res.message });
  }

  static mapToPagedResponse(entriesPropName: string, EntityClass: { fromJSON: Function }) {
    return (data: any) => ({
      total: data.total,
      entries: data[entriesPropName].map(entityJSON => EntityClass.fromJSON(entityJSON))
    });
  }

  constructor(public http: HttpClient) {
  }

  get(url: string, paramMap?, options?: RequestOptionsArgs): Observable<any> {
    let requestOptions: RequestOptionsArgs = Object.assign(
      {}, paramMap ? { params: paramMap } : {},
      options || {});
    return this.http
      .get(url, requestOptions);
  }

  post(url: string, body: any = null, options?: RequestOptionsArgs) {
    return this.http.post(url, body, options);
  }

  put(url: string, body: any = null, options?: RequestOptionsArgs) {
    return this.http.put(url, body, options);
  }

  delete(url: string, paramMap?, options?: RequestOptionsArgs) {
    let requestOptions: RequestOptionsArgs = Object.assign(
      {}, paramMap ? { params: paramMap } : {}, options || {});
    return this.http.delete(url, requestOptions);
  }

}
