import { Subject } from 'rxjs/Subject';
import { ReplaySubject } from 'rxjs/ReplaySubject';
import { Subscription } from 'rxjs/Subscription';
import { combineLatest } from 'rxjs/operators';
import { OnDestroy } from '@angular/core';

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
  MONACO = 'monaco'
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

  protected changes = new Subject<CodeEditorChange>();
  protected loaded = new ReplaySubject(1);
  protected rendered = new ReplaySubject(1);
  protected $ready = this.loaded.pipe(combineLatest(this.rendered, (loaded, rendered) => true));
  // protected state = Observable
  //   .merge(this.loaded, this.rendered)
  //   .pipe(
  //     scan(
  //       (state, loadedOrRendered: STARTUP_EVENT) => ({
  //         loaded: state.loaded || loadedOrRendered === 'load',
  //         rendered: state.rendered || loadedOrRendered === 'render'
  //       }),
  //       { loaded: false, rendered: false }
  //     ),
  //     multicast(new ReplaySubject<{ rendered: boolean, loaded: boolean }>(1))
  //   );

  constructor() {
    // this.$ready.subscribe({
    //   complete: () => null
    // });
  }

  abstract value(nextValue?: string): Promise<string>;

  abstract render(elem, options?): Promise<CodeEditor>;

  abstract dispose(): void;

  abstract resize(): void;

  abstract focus(instructions?: any): void;

  protected require(deps: string[], cb: (...args) => void) {
    let me = this;
    requirejs(deps, function(ace, extEmmet) {
      const loaded = me.loaded;
      if (!loaded.isStopped && !loaded.closed) {
        cb.apply(me, arguments);
        loaded.next(true);
        loaded.complete();
      }
    });
  }

  protected setOption(option: string, value: any) {
    let { setters } = this;
    setters[option](value);
  }

  protected disposeSubjects() {
    this.loaded.unsubscribe();
    this.changes.unsubscribe();
    this.rendered.unsubscribe();
  }

  option(option: string, value?: any) {
    if (value !== undefined) {
      this.cfg[option] = value;
      return this.ready(() => {
        this.setOption(option, value);
        delete this.cfg['value'];
      });
    } else {
      return this.cfg[option];
    }
  }

  options(value?: any) {
    if (value !== undefined) {
      let { cfg } = this;
      Object.assign(cfg, value);
      return this.ready(() => {
        Object.keys(cfg).forEach((opt) => this.setOption(opt, cfg[opt]));
        delete cfg['value'];
      });
    } else {
      return Object.assign({}, this.cfg);
    }
  }

  ready(logic: (x?) => void): Promise<any> {
    return this.$ready
      .toPromise()
      .then(x => (logic && logic(x)) || (this));
  }

  tap(logic: (x?) => void): Promise<any> {
    return this.loaded
      .toPromise()
      .then(x => (logic && logic(x)) || (this));
  }

  subscribe(logic: (e) => void, ...operators): Subscription {
    return (operators.length)
      ? this.changes
        .pipe(...operators)
        .subscribe(logic)
      : this.changes
        .subscribe(logic);
  }

}
