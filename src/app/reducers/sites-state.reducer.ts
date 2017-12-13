import { AnyAction, combineReducers, Reducer } from 'redux';

import { StoreActionsEnum } from '../enums/actions.enum';
import { SiteStateContainer, Workspace } from '../classes/app-state.interface';
import { previewTabs } from './preview-tabs.reducer';
import { selectedItems } from './selected-items.reducer';
import { expandedPanels } from './expanded-panels.reducer';
import { expandedPaths } from './expanded-paths.reducer';
import { isNullOrUndefined } from 'util';
import { createSiteState } from '../utils/state.utils';

const reducer = combineReducers<Workspace>({
  previewTabs,
  selectedItems,
  expandedPanels,
  expandedPaths
});

export const sitesState: Reducer<SiteStateContainer> =
  (state = {}, action: AnyAction) => {
    switch (action.type) {

      case StoreActionsEnum.SELECT_SITE:
        return createSiteStateIfUndefined(state, action.code);

      default: {
        let
          hasChanged = false,
          next = (action.siteCode ? [action.siteCode] : Object.keys(state))
            .reduce((nextState: SiteStateContainer, siteCode: string) => {
              let prevStateForSite = state[siteCode];
              let nextStateForSite = reducer(prevStateForSite, action);
              if (typeof nextStateForSite === 'undefined') {
                throw new Error(
                  getUndefinedStateErrorMessage(siteCode, action));
              }
              nextState[siteCode] = nextStateForSite;
              hasChanged = hasChanged || nextStateForSite !== prevStateForSite;
              return nextState;
            }, {});
        return hasChanged ? next : state;
      }

    }
  };

export function createSiteStateIfUndefined(state, siteCode) {
  if (isNullOrUndefined(state[siteCode])) {
    return {
      ...state,
      [siteCode]: createSiteState({})
    };
  }
  return state;
}

function getUndefinedStateErrorMessage(key, action) {
  const actionType = action && action.type;
  const actionDescription = (actionType && `action "${String(actionType)}"`) || 'an action';
  return (
    `Given ${actionDescription}, reducer "${key}" returned undefined. ` +
    `To ignore an action, you must explicitly return the previous state. ` +
    `If you want this reducer to hold no value, you can return null instead of undefined.`
  );
}

// switch (action.type) {
//   case StoreActionsEnum.SELECT_SITE:
//     let
//       nextState = state,
//       siteCode = action.code;
//     if (siteCode) {
//       nextState = createSiteStateIfUndefined(nextState, siteCode);
//       nextState[action.code] = reducer(nextState[action.code], action);
//     }
//     return nextState;
//
//   default:
//     return state;
// }
