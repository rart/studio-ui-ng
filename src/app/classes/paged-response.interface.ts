export interface PagedResponse<T> {
  total: number;
  entries: Array<T>;
  queryTotal?: number;
}
