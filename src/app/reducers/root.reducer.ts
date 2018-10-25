import { AppState } from '../classes/app-state.interface';
import { Actions } from '../enums/actions.enum';
import { combineReducers } from 'redux';
import { user } from './user.reducer';
import { entities } from './entities.reducer';
import { workspaces } from './workspaces.reducer';
import { activeProjectCode } from './active-project-code.reducer';
import { deliveryTable } from './delivery-table.reducer';
import { settings } from './settings.reducer';
import { editSessions } from './edit-sessions.reducer';
import { auth } from './auth.reducer';
import { previewTabs } from './preview-tabs.reducer';
import { isNullOrUndefined } from 'util';
import { uppy } from './uppy.reducer';
import { explorer } from './explorer.reducer';
import { usersList } from './users-list.reducer';

const foo = (state = null) => state;

export const reducerMap = {

  user,
  auth,
  entities,
  workspaces,
  activeProjectCode,
  editSessions,
  settings,
  uppy,
  explorer,

  deliveryTable,

  // "virtual" props handled by root reducer need
  // a foo reducer for redux core not to complain
  // since the combined reducer runs first
  projectRef: foo,
  workspaceRef: foo,

  // `previewTabs` is also handled by root as it is conditional
  // to whether there is a active project or not
  previewTabs: foo,

  usersList

};

const appReducer = combineReducers<AppState>(reducerMap);

export function rootReducer(state = {} as AppState, action) {

  let
    nextState = state,
    projectCodeActive;

  // Only activate global preview tabs reducer when there's no active project
  projectCodeActive = nextState.activeProjectCode;
  if (
    isNullOrUndefined(projectCodeActive) ||
    isNullOrUndefined(nextState.previewTabs) ||
    action.type === Actions.STUDIO_INIT) {
    let originalPreviewTabs = nextState.previewTabs;
    let nextPreviewTabs = previewTabs(state.previewTabs, action);
    if (originalPreviewTabs !== nextPreviewTabs) {
      nextState = { ...nextState, previewTabs: nextPreviewTabs };
    }
  }

  nextState = appReducer(nextState, action);
  projectCodeActive = nextState.activeProjectCode;

  switch (action.type) {

    case Actions.STUDIO_INIT:
    case Actions.GUEST_CHECK_IN:
    case Actions.OPEN_TAB:
    case Actions.OPEN_TABS:
    case Actions.NAVIGATE_ON_ACTIVE:
    case Actions.TAB_NAVIGATE_BACK:
    case Actions.TAB_NAVIGATE_FORWARD:
    case Actions.CLOSE_TAB:
    case Actions.OPEN_TAB_BACKGROUND:
    case Actions.OPEN_TABS_BACKGROUND:
    case Actions.SELECT_TAB:
      return (projectCodeActive)
        ? spreadRoot(nextState, {
          workspaceRef: nextState.workspaces[projectCodeActive]
        })
        : nextState;

    case Actions.EXPAND_PANEL:
    case Actions.EXPAND_PANELS:
    case Actions.COLLAPSE_PANEL:
    case Actions.COLLAPSE_PANELS: {
      return (projectCodeActive)
        ? spreadRoot(nextState, {
          workspaceRef: {
            ...nextState.workspaceRef,
            expandedPanels: nextState.workspaces[projectCodeActive].expandedPanels
          }
        })
        : nextState;
    }

    case Actions.SELECT_ITEM:
    case Actions.SELECT_ITEMS:
    case Actions.DESELECT_ITEM:
    case Actions.DESELECT_ITEMS:
      return (projectCodeActive)
        ? spreadRoot(nextState, {
          workspaceRef: {
            ...nextState.workspaceRef,
            selectedItems: nextState.workspaces[projectCodeActive].selectedItems
          }
        })
        : nextState;

    case Actions.PROJECTS_FETCHED: {
      return (projectCodeActive)
        ? spreadRoot(nextState, {
          projectRef: action.projects.find(project => project.code === projectCodeActive),
          workspaceRef: nextState.workspaces[projectCodeActive]
        })
        : nextState;

    }

    case Actions.SELECT_PROJECT: {
      let newActiveCode = action.code;
      return spreadRoot(nextState, {
        projectRef: nextState.entities.projects.byId[newActiveCode],
        workspaceRef: nextState.workspaces[newActiveCode]
      });
    }

    case Actions.DESELECT_PROJECT: {
      return spreadRoot(nextState, {
        projectRef: null,
        workspaceRef: null
      });
    }

    default:
      return nextState;

  }

}

function spreadRoot(root, spreads) {
  return Object.assign({}, root, ...spreads);
}
