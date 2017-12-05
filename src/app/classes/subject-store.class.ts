import {Reducer, Store, Unsubscribe} from 'redux';
import {Subject} from 'rxjs/Subject';
import { Subscription, TeardownLogic } from 'rxjs/Subscription';
import { OperatorFunction } from 'rxjs/interfaces';
import { Observable } from 'rxjs/Observable';
import { Subscriber } from 'rxjs/Subscriber';
import { AppState } from './app-state.interface';
import { filter, map } from 'rxjs/operators';

export class SubjectStore<T> implements Store<T> {

  private storeStream: Observable<AppState>;
  private branchStream = new Subject<keyof T>();

  constructor(private store: Store<T>) {
    this.storeStream = Observable.create((subscriber: Subscriber<T>): TeardownLogic => {
      let tearDown = store.subscribe(() =>
        subscriber.next(store.getState()));
      return { unsubscribe: tearDown };
    });
  }

  dispatch(action) {

    let
      affectedBranches = action.affects || [],
      superReturnValue = this.store.dispatch(action);

    // Assumes by this time redux updated the store
    // tslint:disable-next-line:no-unused-expression
    affectedBranches.forEach(branchKey => {
      this.branchStream.next(branchKey);
    });

    return superReturnValue;

  }

  getState(): T {
    return this.store.getState();
  }

  subscribe(observer: () => void): Unsubscribe {
    return <Unsubscribe> this.store.subscribe(observer);
  }

  replaceReducer(nextReducer: Reducer<T>): void {
    this.store.replaceReducer(nextReducer);
  }

  subscribeTo<R>(stateBranchKey: keyof T,
                 subscriber: (branch) => void,
                 ...operators: OperatorFunction<T, R>[]): Subscription {
    return this.branchStream
      .pipe(
        filter(key => key === stateBranchKey),
        map((key: string) => this.getState()[key]),
        ...(operators || [])
      )
      .subscribe(subscriber);
  }

  // pipe<R>(...operators: OperatorFunction<T, R>[]): Observable<R> {
  //   return this.storeStream
  //     .pipe.apply(this.storeStream, operators);
  // }

}
