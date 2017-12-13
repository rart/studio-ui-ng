import { Asset } from '../models/asset.model';
import { User } from '../models/user.model';
import { Project } from '../models/project.model';
import { Group } from '../models/group.model';
import { StudioModel } from '../utils/type.utils';

export interface AppState extends ActiveState {
  user: any;
  projectsState: ProjectStateContainer;
  entities?: StateEntities; // do not persist
  // [anything: string]: any;
}

export interface ProjectStateContainer {
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

export interface StateEntities {
  project?: StateEntity<Project>;
  user?: StateEntity<User>;
  group?: StateEntity<Group>;
  asset?: StateEntity<Asset>;
  // role?: StateEntity<StudioModel>;
  // permission?: StateEntity<StudioModel>;
  [key: string]: StateEntity<StudioModel>;
}

export interface StateEntity<T> {
  error: any;
  order?: string[];
  loading: boolean;
  byId: LookUpTable<T>;
}

export interface ActiveState {
  projectRef?: any;
  activeProjectCode: string; // The active project's code
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
