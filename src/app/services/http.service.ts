import {Injectable} from '@angular/core';
import {HttpClient, HttpHeaders, HttpParams} from '@angular/common/http';
import {Observable} from 'rxjs/Observable';

export enum ResponseCodes {
  OK = 'OK'
}

export interface IPagedResponse<T> {
  total: number;
  entries: Array<T>;
}

export interface IPostResponse<T> {
  responseCode: ResponseCodes;
  entity: T;
}

export interface IEntityService<T> {
  all(options?): Promise<IPagedResponse<T>>;
  get(uniqueKey: string | number): Promise<T>;
  create(entity: T): Promise<IPostResponse<T>>;
  update(entity: T): Promise<IPostResponse<T>>;
  delete(entity: T): Promise<IPostResponse<T>>;
}

export interface RequestOptionsArgs {
  headers?: HttpHeaders | {
    [header: string]: string | string[];
  };
  observe?: 'body';
  params?: HttpParams | {
    [param: string]: string | string[];
  };
  reportProgress?: boolean;
  responseType?: 'json';
  withCredentials?: boolean;
}

export const mapToPostResponse = (entity) => {
  return (res: any) => ({ entity: entity, responseCode: res.message  });
};

export const mapToPagedResponse = (entriesPropName: string, EntityClass: { fromJSON: Function }) => {
  return (data: any) => ({
    total: data.total,
    entries: data[entriesPropName].map(entityJSON => EntityClass.fromJSON(entityJSON))
  });
};

@Injectable()
export class StudioHttpService {

  constructor(public http: HttpClient) { }

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
