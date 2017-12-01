import { ResponseCodesEnum } from '../enums/response-codes.enum';

export interface PostResponse<T> {
  responseCode: ResponseCodesEnum;
  entity: T;
}
