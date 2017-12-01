import { Asset } from '../models/asset.model';
import { User } from '../models/user.model';
import { PreviewTab } from './preview-tab.class';

export interface AppState {
  user: User;
  previewTabs: Array<PreviewTab>;
  selectedItems: Array<Asset>;
  expandedPanels: Array<string>;
  expandedPaths: any;
}
