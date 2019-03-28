import { compose, createStore, StoreEnhancer } from 'redux';

import { AppState } from './classes/app-state.interface';
import { rootReducer } from './reducers/root.reducer';

export const devtools = window['__REDUX_DEVTOOLS_EXTENSION__']
  ? window['__REDUX_DEVTOOLS_EXTENSION__']()
  : f => f;

export const create = () =>
  createStore<AppState, any, void, void>(rootReducer, compose(devtools));

export const fromState = (state) => createStore<AppState, any, void, void>(rootReducer, state, compose(devtools));
