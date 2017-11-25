import {Reducer, Store, Unsubscribe} from 'redux';
import {Subject} from 'rxjs/Subject';
import {Subscription} from 'rxjs/Subscription';

export class SubjectStore<T> implements Store<T> {

  private subjects: Map<keyof T, Subject<any>>;

  constructor(private store: Store<T>) {
  }

  dispatch(action) {

    let
      subjects = this.subjects,
      affectedBranches = action.affects || [],
      superReturnValue = this.store.dispatch(action);

    // Assumes by this time redux updated the store
    // tslint:disable-next-line:no-unused-expression
    subjects && affectedBranches.forEach(branchKey => {
      if (subjects.has(branchKey)) {
        subjects.get(branchKey).next(this.getState()[branchKey]);
      }
    });

    return superReturnValue;

  }

  getState(): T {
    return this.store.getState();
  }

  subscribe(observer: () => void): Unsubscribe {
    return this.store.subscribe(observer);
  }

  subscribeTo(observer: () => void, stateBranchKey: keyof T): Subscription {

    if (!this.subjects) {
      this.subjects = new Map();
    }

    let
      map = this.subjects,
      subject = map.get(stateBranchKey) || new Subject();

    map.set(stateBranchKey, subject);

    return subject.subscribe(observer);

  }

  replaceReducer(nextReducer: Reducer<T>): void {
    this.store.replaceReducer(nextReducer);
  }

}
