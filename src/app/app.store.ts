import {
  StoreEnhancer,
  combineReducers,
  createStore,
  compose
} from 'redux';

import { AppState } from './classes/app-state.interface';
import { selectedItems } from './reducers/selected-items.reducer';
import { expandedPanels } from './reducers/expanded-panels.reducer';
import { expandedPaths } from './reducers/expanded-paths.reducer';
import { previewTabs } from './reducers/preview-tabs.reducer';
import { user } from './reducers/user.reducer';

export const reducerMap = {
  user,
  selectedItems,
  expandedPanels,
  expandedPaths,
  previewTabs
};

export const appReducer = combineReducers<AppState>(reducerMap);

const devtools: StoreEnhancer<AppState> = window['devToolsExtension']
  ? window['devToolsExtension']()
  : f => f;

export const create = () => createStore<AppState>(appReducer, compose(devtools));
export const fromState = (state) => createStore<AppState>(appReducer, state, compose(devtools));
