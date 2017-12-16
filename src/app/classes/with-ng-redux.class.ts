import { NgRedux } from '@angular-redux/store';
import { AppState } from './app-state.interface';
import { ComponentBase } from './component-base.class';
import { filter } from 'rxjs/operators';
import { isNullOrUndefined } from 'util';

export class WithNgRedux extends ComponentBase {

  protected noNullsAndUnSubOps = [
    filter(x => !isNullOrUndefined(x)),
    this.endWhenDestroyed
  ];

  get state() {
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
