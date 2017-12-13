import { AppState } from '../classes/app-state.interface';
import { StoreActionsEnum } from '../enums/actions.enum';
import { combineReducers } from 'redux';
import { user } from './user.reducer';
import { entities } from './entities.reducer';
import { sitesState } from './sites-state.reducer';
import { activeSiteCode } from './active-site-code.reducer';
import { createPreviewTab, createPreviewTabStateContainer } from '../utils/state.utils';

const foo = (state = null) => state;

export const reducerMap = {

  user,
  entities,
  sitesState,
  activeSiteCode,

  // "virtual" props handled by root reducer need
  // a foo reducer for redux core not to complain
  // since the combined reducer runs first
  siteRef: foo,
  workspaceRef: foo

};

const appReducer = combineReducers<AppState>(reducerMap);

export function rootReducer(state = {} as AppState, action) {

  let nextState = appReducer(state, action);
  let siteCodeActive = nextState.activeSiteCode;

  switch (action.type) {

    case StoreActionsEnum.REDUX_INIT:
      return nextState;

    case StoreActionsEnum.STUDIO_INIT:
    case StoreActionsEnum.GUEST_CHECK_IN:
    case StoreActionsEnum.OPEN_TAB:
    case StoreActionsEnum.NAVIGATE_ON_ACTIVE:
    case StoreActionsEnum.TAB_NAVIGATE_BACK:
    case StoreActionsEnum.TAB_NAVIGATE_FORWARD:
    case StoreActionsEnum.CLOSE_TAB:
    case StoreActionsEnum.OPEN_TAB_BACKGROUND:
    case StoreActionsEnum.SELECT_TAB:
      return (siteCodeActive)
        ? spreadRoot(nextState, {
          workspaceRef: nextState.sitesState[siteCodeActive]
        })
        : nextState;

    case StoreActionsEnum.EXPAND_PANEL:
    case StoreActionsEnum.EXPAND_PANELS:
    case StoreActionsEnum.COLLAPSE_PANEL:
    case StoreActionsEnum.COLLAPSE_PANELS: {
      return (siteCodeActive)
        ? spreadRoot(nextState, {
          workspaceRef: {
            ...nextState.workspaceRef,
            expandedPanels: nextState.sitesState[siteCodeActive].expandedPanels
          }
        })
        : nextState;
    }

    case StoreActionsEnum.SELECT_ITEM:
    case StoreActionsEnum.SELECT_ITEMS:
    case StoreActionsEnum.DESELECT_ITEM:
    case StoreActionsEnum.DESELECT_ITEMS:
      return (siteCodeActive)
        ? spreadRoot(nextState, {
          workspaceRef: {
            ...nextState.workspaceRef,
            selectedItems: nextState.sitesState[siteCodeActive].selectedItems
          }
        })
        : nextState;

    case StoreActionsEnum.SITES_FETCHED: {
      return (siteCodeActive)
        ? spreadRoot(nextState, {
          siteRef: action.sites.find(site => site.code === siteCodeActive),
          workspaceRef: nextState.sitesState[siteCodeActive]
        })
        : nextState;

    }

    case StoreActionsEnum.SELECT_SITE: {
      let newActiveCode = action.code;
      return spreadRoot(nextState, {
        siteRef: nextState.entities.site.byId[newActiveCode],
        workspaceRef: nextState.sitesState[newActiveCode]
      });
    }

    case StoreActionsEnum.DESELECT_SITE: {
      spreadRoot(nextState, {
        siteRef: null,
        workspaceRef: null
      });
      break;
    }

    default:
      return nextState;

  }

}

function spreadRoot(root, spreads) {
  return Object.assign({}, root, ...spreads);
}
