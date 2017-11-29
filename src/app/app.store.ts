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

const tempReducer = (state = null, action) => state;

const appReducer = combineReducers<AppState>({
  user: tempReducer,
  selectedItems,
  expandedPanels,
  expandedPaths
});

const devtools: StoreEnhancer<AppState> = window['devToolsExtension']
  ? window['devToolsExtension']()
  : f => f;

export const create = () => createStore<AppState>(appReducer, compose(devtools));
export const fromState = (state) => createStore<AppState>(appReducer, state, compose(devtools));
