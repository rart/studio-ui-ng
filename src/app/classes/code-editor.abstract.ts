import { Subject } from 'rxjs/Subject';
import { Subscription } from 'rxjs/Subscription';
import { ReplaySubject } from 'rxjs/ReplaySubject';
import { combineLatest, switchMap, takeUntil } from 'rxjs/operators';
import { isNullOrUndefined } from 'util';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';

export interface CodeEditorOptions {
  tabSize: number;
  lang: string;
}

export interface CodeEditorChange {
  value: string;
  originalEvent: any;
}

export enum CodeEditorChoiceEnum {
  ACE = 'ace',
  MONACO = 'monaco',
  MONACO_DIFF = 'monaco[diff]'
}

const DEFAULT_OPTIONS = {
  tabSize: 2,
  lang: 'html',
  folding: true,
  wrap: false,
  editable: true,
  fontSize: 14,
  theme: 'light'
};

export abstract class CodeEditor {

  abstract readonly vendor: CodeEditorChoiceEnum;

  protected cfg = DEFAULT_OPTIONS;
  protected instance: any;
  protected abstract setters: any;

  private internalChangeCtrl$ = new BehaviorSubject<any>(':)');
  protected changes$ = new Subject<CodeEditorChange>();
  protected loaded$ = new ReplaySubject(1);
  protected rendered$ = new ReplaySubject(1);
  protected ready$ = this.loaded$.pipe(combineLatest(this.rendered$, () => true));

  protected valuesQueue = [];
  protected optionQueue = [];
  protected optionsQueue = [];

  protected valueSet$ = new Subject();

  constructor() {

  }

  // abstract value(nextValue?: string): Promise<string>;

  protected abstract vendorSetValue(nextValue): void;

  abstract format(): void;

  abstract render(elem, options?): Promise<CodeEditor>;

  abstract dispose(): void;

  abstract resize(): void;

  abstract focus(instructions?: any): void;

  protected require(deps: string[], cb: (...args) => void) {
    let me = this;
    requirejs(deps, function (ace, extEmmet) {
      const loaded = me.loaded$;
      if (!loaded.isStopped && !loaded.closed) {
        cb.apply(me, arguments);
        loaded.next(true);
        loaded.complete();
      }
    });
  }

  protected setOption(option: string, value: any) {
    let { setters } = this;
    setters[option] && setters[option](value);
  }

  protected disposeSubjects() {
    this.loaded$.unsubscribe();
    this.changes$.unsubscribe();
    this.rendered$.unsubscribe();
    this.internalChangeCtrl$.unsubscribe();
  }

  value(value?: string): Promise<string> {
    let { valuesQueue } = this;
    if (!isNullOrUndefined(value)) {
      valuesQueue.push(value);
    }
    return this.tap(() => {
      if (value !== undefined) {
        let nextValue = valuesQueue.pop();
        if (!isNullOrUndefined(nextValue)) {
          valuesQueue.splice(0);
          this.valueSet$.next(value);
          this.vendorSetValue(nextValue);
          this.internalChangeCtrl$.next(null);
          return nextValue;
        }
      } else {
        return this.instance.getValue();
      }
    });
  }

  getValue() {
    try {
      return this.instance.getValue();
    } catch (e) {
      return '';
    }
  }

  option(option: string, value?: any) {
    if (option === 'value') {
      return this.value(value);
    } else if (value !== undefined) {
      let { cfg, optionQueue } = this;
      optionQueue.push({ option, value });
      return this.ready(() => {
        let nextOptionValue = optionQueue.pop();
        if (!isNullOrUndefined(nextOptionValue)) {
          optionQueue.splice(0);
          cfg[option] = nextOptionValue.value;
          this.setOption(nextOptionValue.option, nextOptionValue.value);
          delete cfg['value'];
        }
      });
    } else {
      return this.cfg[option];
    }
  }

  options(options?: any) {
    options = { ...options };
    if (options !== undefined) {
      let { cfg, optionsQueue } = this;
      if (!isNullOrUndefined(options.value)) {
        this.value(options.value);
        delete options.value;
      }
      optionsQueue.push(options);
      return this.ready(() => {
        let nextOptions = optionsQueue.pop();
        if (!isNullOrUndefined(nextOptions)) {
          optionsQueue.splice(0);
          Object.assign(cfg, nextOptions);
          Object.keys(cfg).forEach((opt) => this.setOption(opt, cfg[opt]));
        }
      });
    } else {
      return Object.assign({}, this.cfg);
    }
  }

  ready(logic: (x?) => void): Promise<any> {
    return this.ready$
      .toPromise()
      .then(x => (logic && logic(x)) || (this));
  }

  tap(logic: (x?) => void): Promise<any> {
    return this.loaded$
      .toPromise()
      .then(x => (logic && logic(x)) || (this));
  }

  subscribe(logic: (e) => void, ...operators): Subscription {
    // setTimeout(() =>
    // // Activate this subscription immediately so subscriber receives
    // // the very next change.
    //   this.internalChangeCtrl$.next());
    return this.internalChangeCtrl$
      .pipe(
        switchMap(() => this.changes$.pipe(takeUntil(this.valueSet$))),
        ...operators
      )
      .subscribe(logic);
  }

}
