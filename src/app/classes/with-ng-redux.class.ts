import { NgRedux } from '@angular-redux/store';
import { AppState } from './app-state.interface';
import { ComponentBase } from './component-base.class';

export class WithNgRedux extends ComponentBase {

  get state(): AppState {
    return this.store.getState();
  }

  constructor(protected store: NgRedux<AppState>) {
    super();
  }

  protected select<T>(...args) {
    return this.store.select<T>(...args);
  }

  protected dispatch(action) {
    this.store.dispatch(action);
  }

}
