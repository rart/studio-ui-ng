import { Asset } from '../models/asset.model';
import { User } from '../models/user.model';

export interface AppState {
  user: User;
  selectedItems: Array<Asset>;
  expandedPanels: Array<string>;
  expandedPaths: any;
}
