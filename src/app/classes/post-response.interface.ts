import { LookupTable } from './app-state.interface';
import { APIResponse } from '../models/service-payloads';

export interface PostResponse<T> {
  response: Partial<APIResponse>;
  entity: T;
}

export interface BulkPostResponse<T> {
  response: Partial<APIResponse>;
  entities: LookupTable<T>;
}
