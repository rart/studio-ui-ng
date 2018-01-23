import { Asset } from '../models/asset.model';
import { User } from '../models/user.model';
import { Project } from '../models/project.model';
import { Group } from '../models/group.model';
import { StudioModel } from '../utils/type.utils';

export interface AppState {
  user: any;
  auth: 'void' | 'fetching' | 'validated' | 'timeout';
  previewTabs?: PreviewTabStateContainer;
  projectRef?: any; // "Virtual" prop, a ref to entities.projects[projectCode]
  workspaceRef?: Workspace; // "Virtual" prop, a ref to workspaces[projectCode]
  activeProjectCode: string; // The active project's code
  workspaces: Workspaces;
  entities?: Entities; // do not persist
  settings?: Settings;
  deliveryTable?: { [uuid: string]: any }; // This feels like a terrible practice. Need to figure out something...
  editSessions?: EditSessions;
}

export interface Workspaces {
  [projectId: string]: Workspace;
}

export interface PreviewTabStateContainer {
  order: string[];
  activeId: string;
  byId: { [uuid: string]: PreviewTab };
}

export interface SidebarState {
  visible: boolean;
}

export interface Workspace {
  settings?: ProjectSettings;
  previewTabs: PreviewTabStateContainer;
  selectedItems: { [assetId: string]: boolean };
  expandedPanels: { [panelKey: string]: boolean };
  expandedPaths: { [assetId: string]: boolean };
}

export interface Settings {
  layout: 'full' | 'contained';
  containedLayoutMax: 1200 | 1300 | 1400 | 1500 | 1600;
  nativeScrollbars: boolean;
  viewAnimation: 'fadeIn' | 'slideUp' | 'slideDown' | 'slideRight' | 'slideLeft' | 'none';
  topBarTheme: string;
  topBarShown: boolean;
  topBarPosition: 'top' | 'inline' | 'none';
  navBarTheme: string;
  navBarShown: boolean;
  navBarPosition: 'top' | 'right' | 'left' | 'none';
  navBarMinimised: boolean;
  footerShown: boolean;
  footerPosition: 'inline' | 'below' | 'none';
  footerTheme: string;
  'meta.click.open.tab.in.background': boolean;
}

export interface UISettings {
  layout: 'full' | 'contained';
  nativeScrollbars: boolean;
  viewAnimation: 'fadeIn' | 'slideUp' | 'slideDown' | 'slideRight' | 'slideLeft' | 'none';
  topBar: {
    theme: string;
    position: 'top' | 'inline' | 'none';
  };
  sidebar: {
    theme: string;
    position: 'top' | 'right' | 'left' | 'none';
    folded: boolean;
  };
}

export interface ProjectSettings {
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

//////////////////
///// PAGES /////
////////////////
// Form view
// Code view
// Preview
//////////////////
///// TEXT //////
////////////////
// Code view
//////////////////
///// IMAGES ////
////////////////
// Crop, yada yada | Could be the same view
// Preview         |
export interface EditSessions {
  activeId: string;
  order: string[];
  byId: {
    [uuid: string]: EditSession;
  };
}

export interface EditSession {
  id: string;
  data: any; // container for components to put what ever they need
  assetId: string;
  projectCode: string;
  fetchPayload: any;
  // synced: boolean; // false = has unsaved changes
  // saving: boolean;
  // fetched: boolean;
  // loading: boolean;
  status: 'void' | 'fetching' | 'fetched' | 'dirty' | 'saving' | 'closing';
}

// export type EditSessionStatus = 'void' | 'fetching' | 'fetched' | 'dirty' | 'saving';
