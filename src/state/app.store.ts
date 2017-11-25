
import {
  StoreEnhancer,
  combineReducers,
  createStore,
  compose
} from 'redux';

import {AppState} from '../app/classes/app-state.interface';
import {reducer as selectedItems} from './selected-items.state';
import {reducer as expandedPanels} from './expanded-panels.state';

const tempReducer = (state = null, action) => state;

const appReducer = combineReducers<AppState>({
  user: tempReducer,
  selectedItems,
  expandedPanels
});

const devtools: StoreEnhancer<AppState> = window['devToolsExtension']
  ? window['devToolsExtension']()
  : f => f;

export const create = () => createStore<AppState>(appReducer, compose(devtools));
export const fromState = (state) => createStore<AppState>(appReducer, state, compose(devtools));
