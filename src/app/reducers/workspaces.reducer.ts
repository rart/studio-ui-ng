import { AnyAction, combineReducers, Reducer } from 'redux';

import { StoreActionsEnum } from '../enums/actions.enum';
import { Workspaces, Workspace } from '../classes/app-state.interface';
import { previewTabs } from './preview-tabs.reducer';
import { selectedItems } from './selected-items.reducer';
import { expandedPanels } from './expanded-panels.reducer';
import { expandedPaths } from './expanded-paths.reducer';
import { isNullOrUndefined } from 'util';
import { createProjectState } from '../utils/state.utils';
import { notNullOrUndefined } from '../app.utils';

const reducer = combineReducers<Workspace>({
  previewTabs,
  selectedItems,
  expandedPanels,
  expandedPaths,
  settings: (state, action) => ({})
});

export const workspaces: Reducer<Workspaces> =
  (state = {}, action: AnyAction) => {
    switch (action.type) {

      case StoreActionsEnum.SELECT_PROJECT:
        return createProjectStateIfUndefined(state, action.code);

      case StoreActionsEnum.STUDIO_INIT:
        let
          hasChanged = false,
          next = Object.keys(state)
            .reduce((nextState: Workspaces, projectCode: string) => {
              let prevStateForProject = state[projectCode];
              let nextStateForProject = reducer(prevStateForProject, action);
              if (typeof nextStateForProject === 'undefined') {
                throw new Error(
                  getUndefinedStateErrorMessage(projectCode, action));
              }
              nextState[projectCode] = nextStateForProject;
              hasChanged = hasChanged || nextStateForProject !== prevStateForProject;
              return nextState;
            }, {});
        return hasChanged ? next : state;

      // TODO: Double check here...
      // Safer to specify all possible actions of the inner reducers
      // or make the property more specific?
      default:
        if (notNullOrUndefined(action.projectCode)) {
          let prevStateForProject = state[action.projectCode];
          let nextStateForProject = reducer(prevStateForProject, action);
          if (typeof nextStateForProject === 'undefined') {
            throw new Error(
              getUndefinedStateErrorMessage(action.projectCode, action));
          }
          return (nextStateForProject !== prevStateForProject)
            ? { ...state, [action.projectCode]: nextStateForProject }
            : state;
        } else {
          return state;
        }

    }
  };

export function createProjectStateIfUndefined(state, projectCode) {
  if (isNullOrUndefined(state[projectCode])) {
    return {
      ...state,
      [projectCode]: createProjectState({})
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
//   case StoreActionsEnum.SELECT_PROJECT:
//     let
//       nextState = state,
//       projectCode = action.code;
//     if (projectCode) {
//       nextState = createProjectStateIfUndefined(nextState, projectCode);
//       nextState[action.code] = reducer(nextState[action.code], action);
//     }
//     return nextState;
//
//   default:
//     return state;
// }
