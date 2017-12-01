import { Subject } from 'rxjs/Subject';
import { AppState } from './app-state.interface';
import { SubjectStore } from './subject-store.class';
import { takeUntil } from 'rxjs/operators';

export class ComponentWithState {

  protected unSubscriber: Subject<any> = new Subject();
  private _until = takeUntil(this.unSubscriber);

  get state() {
    return this.store.getState();
  }

  get until() {
    return this._until;
  }

  constructor(protected store: SubjectStore<AppState>) {

  }

  // noinspection TsLint
  ngOnDestroy() {
    this.unSubscriber.next();
    this.unSubscriber.complete();
  }

  protected addTearDown(tearDownLogic: () => void) {
    this.unSubscriber.subscribe(tearDownLogic);
  }

  protected dispatch(action) {
    this.store.dispatch(action);
  }

  protected subscribeTo(keyMapOrKeys: keyof AppState | {} | Array<keyof AppState>,
                        subscriber: (k) => void = (k) => this[`${keyMapOrKeys}StateChanged`](k)) {
    let
      store = this.store,
      until = this.until;
    if (typeof keyMapOrKeys === 'string') {
      // is a key
      store.subscribeTo(keyMapOrKeys, subscriber, until);
    } else {
      let
        branchKeys,
        branchSubscriberMap;
      if ('slice' in keyMapOrKeys && 'splice' in keyMapOrKeys) {
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
