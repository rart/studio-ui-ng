import { AppState } from './app-state.interface';
import { SubjectStore } from './subject-store.class';
import { AnySubscriber } from '../../@types/globals/AnyObserver.type';
import { ComponentBase } from './component-base.class';

export class ComponentWithState extends ComponentBase {

  get state() {
    return this.store.getState();
  }

  constructor(protected store: SubjectStore<AppState>) {
    super();
  }

  protected dispatch(action) {
    this.store.dispatch(action);
  }

  protected subscribeTo(key: keyof AppState, subscriber?: AnySubscriber);
  // noinspection TsLint
  protected subscribeTo(keys: Array<keyof AppState>, subscriber?: AnySubscriber);
  // noinspection TsLint
  protected subscribeTo(keySubscriberMap: {  }, subscriber?: AnySubscriber);
  protected subscribeTo(keyMapOrKeys: keyof AppState | {} | Array<keyof AppState>,
                        subscriber: AnySubscriber = (key => this[`${keyMapOrKeys}StateChanged`](key))) {
    let
      store = this.store,
      until = this.untilDestroyed();
    if (typeof keyMapOrKeys === 'string') {
      // is a key
      store.subscribeTo(keyMapOrKeys as keyof AppState, subscriber, until);
    } else {
      let
        branchKeys,
        branchSubscriberMap;
      if (Array.isArray(keyMapOrKeys)) {
        // is array
        branchKeys = <Array<keyof AppState>>keyMapOrKeys;
      } else {
        // is a map
        branchSubscriberMap = keyMapOrKeys;
        branchKeys = Object.keys(keyMapOrKeys);
      }
      branchKeys.forEach((key) =>
        store.subscribeTo(key,
          branchSubscriberMap
            ? branchSubscriberMap[key]
            : (branch) => this[`${key}StateChanged`](branch),
          until));
    }
  }

}
