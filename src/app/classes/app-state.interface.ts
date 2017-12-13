import { Asset } from '../models/asset.model';
import { User } from '../models/user.model';
import { Project } from '../models/project.model';
import { Group } from '../models/group.model';
import { StudioModel } from '../utils/type.utils';

export interface AppState {
  user: any;
  projectRef?: any; // "Virtual" prop, a ref to entities.projects[projectCode]
  workspaceRef?: Workspace; // "Virtual" prop, a ref to workspaces[projectCode]
  activeProjectCode: string; // The active project's code
  workspaces: Workspaces;
  entities?: Entities; // do not persist
}

export interface Workspaces {
  [projectId: string]: Workspace;
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

export interface Entities {
  projects?: StateEntity<Project>;
  users?: StateEntity<User>;
  groups?: StateEntity<Group>;
  assets?: StateEntity<Asset>;
  // roles?: StateEntity<StudioModel>;
  // permissions?: StateEntity<StudioModel>;
  [pluralEntityName: string]: StateEntity<StudioModel>;
}

export interface StateEntity<T> {
  error: any;
  order?: string[];
  loading: boolean;
  byId: LookUpTable<T>;
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
  projectCode: string;
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
