
import { AppState } from './app-state.interface';
import { SubjectStore } from './subject-store.class';

export class ComponentWithState {

  protected subs = [];

  get state() { return this.store.getState(); }

  constructor(protected store: SubjectStore<AppState>) {

  }

  // noinspection TsLint
  ngOnDestroy() {
    this.terminateSubscriptions();
  }

  protected terminateSubscriptions(subs = this.subs) {
    let i = subs.length;
    while (i-- > 0) {
      let subscription = this.subs.pop();
      if (subscription.unsubscribe) {
        // Subjects
        subscription.unsubscribe();
      } else {
        subscription();
      }
    }
  }

  protected subscribeTo(stateBranch: keyof AppState | {  }, observer?: () => void) {
    let
      store = this.store,
      subs = this.subs;
    if (typeof stateBranch === 'string') {
      return subs.push(store.subscribeTo(observer, stateBranch));
    } else {
      Object.keys(stateBranch).forEach((key) => subs.push(store.subscribeTo(stateBranch[key], <keyof AppState>key)));
    }
  }

}
