import { Asset } from '../models/asset.model';
import { User } from '../models/user.model';
import { Site } from '../models/site.model';
import { Group } from '../models/group.model';
import { StudioModel } from '../utils/type.utils';

export interface AppState extends ActiveState {
  user: any;
  sitesState: SiteStateContainer;
  entities?: StateEntities; // do not persist
  // [anything: string]: any;
}

export interface SiteStateContainer {
  [siteId: string]: Workspace;
}

export interface PreviewTabStateContainer {
  order: string[];
  activeId: string;
  byId: { [uuid: string]: PreviewTab };
}

export interface Workspace {
  settings?: Settings;
  previewTabs: PreviewTabStateContainer;
  selectedItems: { [assetId: string]: boolean };
  expandedPanels: { [panelKey: string]: boolean };
  expandedPaths: { [assetId: string]: boolean };
}

export interface Settings {
  [props: string]: any;
}

export interface StateEntities {
  site?: StateEntity<Site>;
  user?: StateEntity<User>;
  group?: StateEntity<Group>;
  asset?: StateEntity<Asset>;
  // role?: StateEntity<StudioModel>;
  // permission?: StateEntity<StudioModel>;
  [key: string]: StateEntity<StudioModel>;
}

export interface StateEntity<T> {
  error: any;
  list: T[];
  loading: boolean;
  byId: { [entityId: string]: T };
}

export interface ActiveState {
  siteRef?: any;
  activeSiteCode: string; // The active site's code
  workspaceRef?: Workspace;
}

export interface PreviewTabHistory {
  index: number;
  hasBack: boolean;
  hasForward: boolean;
  entries: PreviewTabCore[];
}

export interface PreviewTabCore {
  url: string;
  title: string;
  assetId: string;
  siteCode: string;
}

export interface PreviewTab extends PreviewTabCore {
  id: string;
  pending: boolean;
  history: PreviewTabHistory;
}

export interface EntityLookupTable<T> {
  [id: string]: T;
}

export interface LookUpTable<T> {
  [id: string]: T;
}

export interface EditorContainer {
  tab: {
    session: any;
    original: any;
    synced: boolean; // false = has unsaved changes
    assetId: string;
    saving: boolean;
    loading: boolean;
  };
}
