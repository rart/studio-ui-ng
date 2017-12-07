import { Subject } from 'rxjs/Subject';
import { takeUntil } from 'rxjs/operators';

export class ComponentBase {

  protected unSubscriber$: Subject<any> = new Subject();
  private until$ = takeUntil(this.unSubscriber$);

  get takeUntil() {
    return this.until$;
  }

  // noinspection TsLint
  ngOnDestroy() {
    this.unSubscriber$.next();
    this.unSubscriber$.complete();
  }

  protected addTearDown(tearDownLogic: () => void) {
    this.unSubscriber$.subscribe(tearDownLogic);
  }

}
