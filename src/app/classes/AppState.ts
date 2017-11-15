
export interface Action {
  type: string;
  payload?: any;
}

export interface SidebarContainerState {
  id: string;
  collapsed: boolean;
}

export interface AppState {
  sidebar: {};
}
