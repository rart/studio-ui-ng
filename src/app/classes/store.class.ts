import {Dispatch, Reducer, Store as StoreBase, Unsubscribe} from 'redux';
import {Subject} from 'rxjs/Subject';
import {Subscription} from 'rxjs/Subscription';
import {ActionTypesList} from '../../state/actions.enum';

export class Store<T> implements StoreBase<T> {

  private subjects: Map<keyof T, Subject<any>>;

  constructor(private store: StoreBase<T>,
              private actionBranchMap: Map<ActionTypesList, keyof T>) {
  }

  dispatch(action) {

    let
      subjects = this.subjects,
      actionBranchMap = this.actionBranchMap,
      appStateBranchKey = actionBranchMap[action.type],
      superReturnValue = this.store.dispatch(action);

    // Assumes by this time redux updated the store
    if (subjects.has(appStateBranchKey)) {
      subjects.get(appStateBranchKey).next();
    }

    return superReturnValue;

  }

  getState(): T {
    return this.store.getState();
  }

  subscribe(observer: () => void): Unsubscribe {
    return this.store.subscribe(observer);
  }

  subscribeTo(observer: () => void, stateTreeBranchName: keyof T): Subscription {

    if (!this.subjects) {
      this.subjects = new Map();
    }

    let
      map = this.subjects,
      subject = map.get(stateTreeBranchName) || new Subject();

    map.set(stateTreeBranchName, subject);

    return subject.subscribe(observer);

  }

  replaceReducer(nextReducer: Reducer<T>): void {
    this.store.replaceReducer(nextReducer);
  }

}
