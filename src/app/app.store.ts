import { compose, createStore, StoreEnhancer } from 'redux';

import { AppState } from './classes/app-state.interface';
import { rootReducer } from './reducers/root.reducer';

export const devtools: StoreEnhancer<AppState> = window['devToolsExtension']
  ? window['devToolsExtension']()
  : f => f;

export const create = () => createStore<AppState>(rootReducer, compose(devtools));

export const fromState = (state) => createStore<AppState>(rootReducer, state, compose(devtools));
