import { AnyAction, Store } from 'redux';
import { AppState } from './app-state.interface';
import { NgRedux } from '@angular-redux/store';

export class StudioPluginHost {
  constructor(private store: Store<AppState>) {

  }

  getState(): AppState {
    return this.store.getState();
  }

  dispatch(action: AnyAction) {
    this.store.dispatch(action);
  }

  subscribe(subscriber: () => void) {
    return this.store.subscribe(subscriber);
  }

  select<T>(selector, comparator) {
    return (<NgRedux<AppState>>this.store).select<T>(selector, comparator);
  }
}
