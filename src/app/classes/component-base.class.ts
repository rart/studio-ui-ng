import { Subject, Observable, MonoTypeOperatorFunction } from 'rxjs';
import { filter, takeUntil } from 'rxjs/operators';
import { notNullOrUndefined } from '../app.utils';
import { isNullOrUndefined } from 'util';

let filterOperator;

function initFilterOp() {
  if (isNullOrUndefined(filterOperator)) {
    filterOperator = filter(x => notNullOrUndefined(x));
  }
}

export class ComponentBase {

  protected ngOnDestroy$: Subject<any> = new Subject();
  private cachedTakeUntilOp;

  // noinspection TsLint
  ngOnDestroy() {
    this.ngOnDestroy$.next();
    this.ngOnDestroy$.complete();
    this.ngOnDestroy$.unsubscribe();
  }

  protected addTearDown(tearDownLogic: () => void) {
    this.ngOnDestroy$.subscribe(tearDownLogic);
  }

  protected pipeFilterAndTakeUntil<A>(source$: Observable<A>, ...operators: MonoTypeOperatorFunction<A>[]): Observable<A> {
    initFilterOp();
    this.initTakeUntilOp();
    return source$.pipe.apply(
      source$,
      [
        this.filterNulls(),
        this.untilDestroyed(),
        ...operators
      ]);
  }

  protected filterNulls<T>(): MonoTypeOperatorFunction<T> {
    initFilterOp();
    return <MonoTypeOperatorFunction<T>>filterOperator;
  }

  protected untilDestroyed<T>(): MonoTypeOperatorFunction<T> {
    this.initTakeUntilOp();
    return <MonoTypeOperatorFunction<T>>this.cachedTakeUntilOp;
  }

  private initTakeUntilOp() {
    if (isNullOrUndefined(this.cachedTakeUntilOp)) {
      this.cachedTakeUntilOp = takeUntil(this.ngOnDestroy$);
    }
  }

}
