import {Injectable} from '@angular/core';
import {environment} from '../../environments/environment';
import {StudioHttpService} from './http.service';
import {ContentItem} from '../models/content-item.model';

const baseUrl = `${environment.baseUrl}/content`;

@Injectable()
export class ContentService {

  constructor(private httpService: StudioHttpService) {}

  tree(site, path, depth = 1) {
    return this.httpService.get(
      `${baseUrl}/get-items-tree.json`,
      {site, path, depth})
      .map(response => ContentItem.fromJSON(response.item));
  }

}
