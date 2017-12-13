import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs/Observable';
import { RequestOptionsArgs } from '../classes/request-options-args.interface';
import { isNullOrUndefined } from 'util';
import { parseEntity} from '../utils/api.utils';
import { StudioModelType } from '../utils/type.utils';

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

  static mapToPagedResponse(entriesPropName: string, EntityClass: StudioModelType) {
    return (data: any) => ({
      total: data.total,
      entries: data[entriesPropName].map(entityJSON => parseEntity(EntityClass, entityJSON))
    });
  }

  constructor(private http: HttpClient) { }

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
