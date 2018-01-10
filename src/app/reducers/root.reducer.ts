import { AppState } from '../classes/app-state.interface';
import { StoreActionsEnum } from '../enums/actions.enum';
import { combineReducers } from 'redux';
import { user } from './user.reducer';
import { entities } from './entities.reducer';
import { workspaces } from './workspaces.reducer';
import { activeProjectCode } from './active-project-code.reducer';
import { deliveryTable } from './delivery-table.reducer';
import { settings } from './settings.reducer';
import { editSessions } from './edit-sessions.reducer';
import { sidebar } from './sidebar.reducer';
import { auth } from './auth.reducer';
import { previewTabs } from './preview-tabs.reducer';

const foo = (state = null) => state;

export const reducerMap = {

  user,
  auth,
  entities,
  workspaces,
  previewTabs,
  activeProjectCode,
  editSessions,
  settings,
  sidebar,

  deliveryTable,

  // "virtual" props handled by root reducer need
  // a foo reducer for redux core not to complain
  // since the combined reducer runs first
  projectRef: foo,
  workspaceRef: foo

};

const appReducer = combineReducers<AppState>(reducerMap);

export function rootReducer(state = {} as AppState, action) {

  let nextState = appReducer(state, action);
  let projectCodeActive = nextState.activeProjectCode;

  switch (action.type) {

    case StoreActionsEnum.STUDIO_INIT:
    case StoreActionsEnum.GUEST_CHECK_IN:
    case StoreActionsEnum.OPEN_TAB:
    case StoreActionsEnum.NAVIGATE_ON_ACTIVE:
    case StoreActionsEnum.TAB_NAVIGATE_BACK:
    case StoreActionsEnum.TAB_NAVIGATE_FORWARD:
    case StoreActionsEnum.CLOSE_TAB:
    case StoreActionsEnum.OPEN_TAB_BACKGROUND:
    case StoreActionsEnum.SELECT_TAB:
      return (projectCodeActive)
        ? spreadRoot(nextState, {
          workspaceRef: nextState.workspaces[projectCodeActive]
        })
        : nextState;

    case StoreActionsEnum.EXPAND_PANEL:
    case StoreActionsEnum.EXPAND_PANELS:
    case StoreActionsEnum.COLLAPSE_PANEL:
    case StoreActionsEnum.COLLAPSE_PANELS: {
      return (projectCodeActive)
        ? spreadRoot(nextState, {
          workspaceRef: {
            ...nextState.workspaceRef,
            expandedPanels: nextState.workspaces[projectCodeActive].expandedPanels
          }
        })
        : nextState;
    }

    case StoreActionsEnum.SELECT_ITEM:
    case StoreActionsEnum.SELECT_ITEMS:
    case StoreActionsEnum.DESELECT_ITEM:
    case StoreActionsEnum.DESELECT_ITEMS:
      return (projectCodeActive)
        ? spreadRoot(nextState, {
          workspaceRef: {
            ...nextState.workspaceRef,
            selectedItems: nextState.workspaces[projectCodeActive].selectedItems
          }
        })
        : nextState;

    case StoreActionsEnum.PROJECTS_FETCHED: {
      return (projectCodeActive)
        ? spreadRoot(nextState, {
          projectRef: action.projects.find(project => project.code === projectCodeActive),
          workspaceRef: nextState.workspaces[projectCodeActive]
        })
        : nextState;

    }

    case StoreActionsEnum.SELECT_PROJECT: {
      let newActiveCode = action.code;
      return spreadRoot(nextState, {
        projectRef: nextState.entities.projects.byId[newActiveCode],
        workspaceRef: nextState.workspaces[newActiveCode]
      });
    }

    case StoreActionsEnum.DESELECT_PROJECT: {
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
