import { Reducer } from 'redux';
import { StoreActionsEnum } from '../enums/actions.enum';
import { PreviewTab, PreviewTabProps } from '../classes/preview-tab.class';
import { isNullOrUndefined } from 'util';

function findTabByAssetId(state, assetId) {
  let index = state.findIndex(tab => (tab.asset) && (tab.asset.id === assetId));
  return (index !== -1) && state[index];
}

function findTabByUrlAndSiteCode(state, url, siteCode) {
  let index = state.findIndex(tab => (tab.url === url) && (tab.siteCode === siteCode));
  return (index !== -1) && state[index];
}

function setAsActiveByTabId(state, id) {
  return state.map(tab => ((tab.active = (tab.id === id)) && tab || tab));
}

function getActive(state: Array<PreviewTab>): PreviewTab {
  return state.find(tab => tab.active);
}

function navigateOnActive(state, source) {
  navigateWith(getActive(state), source);
  return state;
}

function navigateWith(tab, source) {
  tab.navigate(
    source.siteCode,
    source.url,
    source.title || undefined,
    source.asset || undefined,
    source.edit || false);
}

export const previewTabs: Reducer<PreviewTabProps[]> = (state = [], action) => {
  switch (action.type) {

    case StoreActionsEnum.EDIT_ASSET: {
      let
        nextState = state,
        { asset, url, siteCode } = action.tab,
        tab = findTabByUrlAndSiteCode(nextState, url, siteCode);
      if (tab) {
        if (!tab.active) {
          nextState = setAsActiveByTabId(nextState, tab.id);
        }
      } else {
        tab = getActive(<Array<PreviewTab>>state);
      }
      navigateWith(tab, {
        ...action.tab,
        isNew: false,
        title: asset.label,
        edit: true
      });
      return nextState;
    }

    case StoreActionsEnum.OPEN_TAB: {
      return setAsActiveByTabId([...state, action.tab], action.tab.id);
    }

    case StoreActionsEnum.NAVIGATE_ON_ACTIVE: {
      return navigateOnActive(state, action.tab);
    }

    case StoreActionsEnum.CLOSE_TAB: {
      let
        tabs = state,
        id = action.id,
        index = tabs.findIndex(tab => tab.id === id),
        tabToClose = tabs[index];
      if (tabs.length > 1 && tabToClose.active) {
        // If closed was the active one, assign
        // the nearest anterior tabToClose as active
        tabs = [...state].splice(index, 1);
        return setAsActiveByTabId(tabs, id);
      } else {
        return state.filter(tab => tab.id !== id);
      }
    }

    case StoreActionsEnum.OPEN_TAB_BACKGROUND: {
      return [...state, action.tab];
    }

    case StoreActionsEnum.SELECT_TAB: {
      return setAsActiveByTabId(state, action.id);
    }

    case StoreActionsEnum.STATE_INIT: {
      let
        nextState = [],
        hasActive = false;
      state
        .forEach(tab => {
          nextState.push(tab instanceof PreviewTab ? tab : PreviewTab.deserialize(tab));
          hasActive = hasActive || tab.active;
        });
      if (!hasActive && state.length) {
        nextState[0].active = true;
      }
      return nextState;
    }

    default:
      return state;

  }
};
