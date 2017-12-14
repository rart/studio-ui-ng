import { Reducer } from 'redux';
import { StoreActionsEnum } from '../enums/actions.enum';
import { isFunction, isNullOrUndefined, isNumber } from 'util';
import {
  createLookupTable,
  createPreviewTab,
  createPreviewTabHistoryEntry,
  createPreviewTabStateContainer
} from '../utils/state.utils';
import {
  PreviewTab,
  PreviewTabCore,
  PreviewTabHistory,
  PreviewTabStateContainer
} from '../classes/app-state.interface';

/*
 * !!!!!!!!!!!!!!!!!! NOTE TO DEVELOPERS !!!!!!!!!!!!!!!!!!
 * Update root reducer workspaceRef & projectRef when ever action affects the workspace
 * */

export const previewTabs: Reducer<PreviewTabStateContainer> =
  (state: PreviewTabStateContainer = createPreviewTabStateContainer({}), action) => {

    let
      id = action.id,
      nextState = state,
      tab: PreviewTab,
      activeId = state.activeId,
      active = state.byId[activeId],
      core: PreviewTabCore = action.tab,
      history: PreviewTabHistory = active && active.history;

    switch (action.type) {

      case StoreActionsEnum.REDUX_INIT:
        return createPreviewTabStateContainer(state);

      case StoreActionsEnum.GUEST_CHECK_IN: {
        nextState = (active.pending) ? state : trackHistoryEntry(state, active, core);
        active = nextState.byId[nextState.activeId];
        return replaceWithNewVersion(
          // if it wasn't pending, the check in means navigation from guest, so
          // need to track this as a new history entry
          nextState,
          // active, gets replaced by it's new version
          active,
          {
            // spread in existing tab props
            ...active,
            // override with the new from action
            ...core,
            // since guest is checking in, it's no longer pending
            pending: false,
            // Only need to replace history if the tab wasn't "pending".
            // Otherwise, the history has been tracked by 'trackHistoryEntry'
            history: !active.pending ? active.history : {
              ...history,
              entries: updateCurrentHistoryEntry(history, core)
            }
          });
      }

      case StoreActionsEnum.OPEN_TAB:
        tab = createPreviewTab(core);
        return setActive(addTab(state, tab), tab);

      case StoreActionsEnum.NAVIGATE_ON_ACTIVE:
        nextState = trackHistoryEntry(state, active, core);
        if (nextState === state) {
          // same URL as it is current was request; no action taken.
          return state;
        }
        active = nextState.byId[nextState.activeId];
        tab = { ...active, pending: true, ...core };
        return replaceWithNewVersion(
          nextState,
          active,
          tab);

      case StoreActionsEnum.TAB_NAVIGATE_BACK:
      case StoreActionsEnum.TAB_NAVIGATE_FORWARD:
        tab = state.byId[id];
        history = tab.history;
        if (
          (action.type === StoreActionsEnum.TAB_NAVIGATE_BACK && history.hasBack) ||
          (history.hasForward)) {

          let newIndex = (action.type === StoreActionsEnum.TAB_NAVIGATE_BACK)
            ? (history.index - 1)
            : (history.index + 1);

          return replaceWithNewVersion(state, tab, {
            ...tab,
            ...history.entries[newIndex],
            history: {
              ...history,
              hasBack: (newIndex > 0),
              hasForward: (newIndex < (history.entries.length - 1)),
              index: newIndex
            }
          });
        } else {
          return state;
        }

      case StoreActionsEnum.CLOSE_TAB:
        if ((state.order.length > 1) && (activeId === id)) {
          // If closed was the active one, assign
          // the nearest anterior tabToClose as active
          let index = state.order.findIndex(tabId => tabId === activeId);
          let newActive = state.byId[ state.order[index - 1] ];
          nextState = setActive(state, newActive);
        }
        return deleteTab(nextState, id);

      case StoreActionsEnum.OPEN_TAB_BACKGROUND:
        return addTab(state, createPreviewTab(core));

      case StoreActionsEnum.SELECT_TAB:
        return setActive(nextState, nextState.byId[id]);

      default:
        return state;

    }

  };

function newArrayWithReplacedEntry(array, index, replacementEntry) {
  return array.map((entry, i) =>
    (isFunction(index) ? index(entry, i) : (i === index))
      ? replacementEntry
      : entry);
}

function updateCurrentHistoryEntry(history: PreviewTabHistory, core: PreviewTabCore) {
  return newArrayWithReplacedEntry(
    history.entries,
    history.index,
    // Right now, when guest checks in is not bringing it's asset ID.
    // Can't just replace it with the "core" for that reason.
    { ...history.entries[history.index], ...core });
}

function replaceWithNewVersion(state: PreviewTabStateContainer, tab, replacement): PreviewTabStateContainer {
  return {
    ...state,
    byId: {
      ...state.byId,
      [replacement.id]: replacement
    }
  };
}

function addTab(state: PreviewTabStateContainer, tab): PreviewTabStateContainer {
  return {
    ...state,
    byId: { ...state.byId, [tab.id]: tab },
    order: [...state.order, tab.id]
  };
}

function setActive(state: PreviewTabStateContainer, tab): PreviewTabStateContainer {
  return {
    ...state,
    activeId: tab.id
  };
}

function deleteTab(state: PreviewTabStateContainer, id): PreviewTabStateContainer {
  return {
    ...state,
    order: state.order.filter(tabId => tabId !== id),
    byId: deleteKey({ ...state.byId }, id)
  };
}

function deleteKey(obj, key) {
  delete obj[key];
  return obj;
}

function trackHistoryEntry(state: PreviewTabStateContainer, tab: PreviewTab, newEntry: PreviewTabCore): PreviewTabStateContainer {
  let
    history = tab.history,
    index = history.index,
    currentEntry = history.entries[index];
  if (
    (isNullOrUndefined(currentEntry)) ||
    (currentEntry.projectCode !== newEntry.projectCode) ||
    (currentEntry.url !== newEntry.url)) {
    let sliceHistory = (index < (history.entries.length - 1));
    return {
      ...state,
      byId: {
        ...state.byId,
        [tab.id]: {
          ...tab,
          history: {
            // Resetting all props for the time beeing.
            // Note to change if additional props are added to the History interface
            // ...history,
            hasForward: sliceHistory ? false : history.hasForward,
            hasBack: true,
            index: index + 1,
            entries: sliceHistory
              ? history.entries.slice(0, index + 1).concat(createPreviewTabHistoryEntry(newEntry))
              : history.entries.concat(createPreviewTabHistoryEntry(newEntry))
          }
        }
      }
    };
  }
  return state;
}

// const previewTabs = combineReducers<PreviewTabStateContainer>({
//   active,
//   activeId,
//   list,
//   byId,
// });

// const active: Reducer<Object> = (state = null, action) => {
//   switch (action.type) {
//     case StoreActionsEnum.OPEN_TAB:
//       return createPreviewTab(action.tab);
//     case StoreActionsEnum.NAVIGATE_ON_ACTIVE:
//       //
//   }
// };

// const activeId: Reducer<Object> = (state = null, action) => {
//   switch (action.type) {
//     case StoreActionsEnum.OPEN_TAB:
//
//   }
// };

// const list: Reducer<Object> = (state = null, action) => {
//   switch (action.type) {
//     case StoreActionsEnum.OPEN_TAB:
//
//   }
// };

// const byId: Reducer<Object> = (state = null, action) => {
//   switch (action.type) {
//     case StoreActionsEnum.OPEN_TAB:
//
//   }
// };

// export const previewTabs: Reducer<PreviewTabProps[]> = (state = [], action) => {
//   switch (action.type) {
//
//     case StoreActionsEnum.OPEN_TAB: {
//       return setAsActiveByTabId([...state, action.tab], action.tab.id);
//     }
//
//     case StoreActionsEnum.NAVIGATE_ON_ACTIVE: {
//       return navigateOnActive(state, action.tab);
//     }
//
//     case StoreActionsEnum.CLOSE_TAB: {
//       let
//         tabs = state,
//         id = action.id,
//         index = tabs.findIndex(tab => tab.id === id),
//         tabToClose = tabs[index];
//       if (tabs.length > 1 && tabToClose.active) {
//         // If closed was the active one, assign
//         // the nearest anterior tabToClose as active
//         tabs = [...state].splice(index, 1);
//         return setAsActiveByTabId(tabs, id);
//       } else {
//         return state.filter(tab => tab.id !== id);
//       }
//     }
//
//     case StoreActionsEnum.OPEN_TAB_BACKGROUND: {
//       return [...state, action.tab];
//     }
//
//     case StoreActionsEnum.SELECT_TAB: {
//       return setAsActiveByTabId(state, action.id);
//     }
//
//     case StoreActionsEnum.STUDIO_INIT: {
//       let
//         nextState = [],
//         hasActive = false;
//       state
//         .forEach(tab => {
//           nextState.push(tab instanceof PreviewTab ? tab : PreviewTab.deserialize(tab));
//           hasActive = hasActive || tab.active;
//         });
//       if (!hasActive && state.length) {
//         nextState[0].active = true;
//       }
//       return nextState;
//     }
//
//     default:
//       return state;
//
//   }
// };
//
// function findTabByAssetId(state, assetId) {
//   let index = state.findIndex(tab => (tab.asset) && (tab.asset.id === assetId));
//   return (index !== -1) && state[index];
// }
//
// function findTabByUrlAndProjectCode(state, url, projectCode) {
//   let index = state.findIndex(tab => (tab.url === url) && (tab.projectCode === projectCode));
//   return (index !== -1) && state[index];
// }
//
// function setAsActiveByTabId(state, id) {
//   return state.map(tab => ((tab.active = (tab.id === id)) && tab || tab));
// }
//
// function getActive(state: Array<PreviewTab>): PreviewTab {
//   return state.find(tab => tab.active);
// }
//
// function navigateOnActive(state, source) {
//   navigateWith(getActive(state), source);
//   return state;
// }
//
// function navigateWith(tab, source) {
//   tab.navigate(
//     source.projectCode,
//     source.url,
//     source.title || undefined,
//     source.asset || undefined,
//     source.edit || false);
// }
