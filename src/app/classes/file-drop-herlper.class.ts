import { forkJoin } from 'rxjs/observable/forkJoin';
import { filter, takeUntil, tap } from 'rxjs/operators';
import { fromEvent } from 'rxjs/observable/fromEvent';
import { Subject } from 'rxjs/Subject';
import { fromPromise } from 'rxjs/observable/fromPromise';
import { Observable } from 'rxjs/Observable';
import { ArrayUtils } from '../utils/array.utils';
import { merge } from 'rxjs/observable/merge';
import * as flatten from 'flatten';

const CLASS = 'drag-over';

export class FileDropHelper {

  dragenter$: Observable<Event>;
  dragover$: Observable<Event>;
  dragleave$: Observable<Event>;
  drop$: Observable<Event>;
  ctrl$: Observable<any>;
  files$ = new Subject();
  text$ = new Subject();

  private elem;
  private terminator$ = new Subject();

  constructor(elem) {

    if (typeof elem === 'string') {
      let selector = elem;
      elem = document.querySelector(elem);
      if (!elem) {
        throw new Error(`"${selector}" does not match any HTML elements`);
      }
    }

    if (!elem) {
      throw new Error(`"${elem}" is not a valid HTML element`);
    }

    let dragenter$, dragover$, dragleave$, drop$, ctrl$;

    dragenter$ = fromEvent(elem, 'dragenter')
      .pipe(tap(e => prevent(e)));

    dragover$ = fromEvent(elem, 'dragover')
      .pipe(tap(e => prevent(e) || addClass()));

    dragleave$ = fromEvent(elem, 'dragleave')
      .pipe(tap(e => prevent(e) || removeClass()));

    drop$ = fromEvent(elem, 'drop')
      .pipe(tap(e => prevent(e) || removeClass()));

    ctrl$ = merge<Event>(dragenter$, dragover$, dragleave$, drop$)
      .pipe(filter(e => e.type === 'drop'));

    this.elem = elem;
    this.dragenter$ = dragenter$;
    this.dragover$ = dragover$;
    this.dragleave$ = dragleave$;
    this.drop$ = drop$;
    this.ctrl$ = ctrl$;

    function addClass() {
      elem.classList.add(CLASS);
    }

    function removeClass() {
      elem.classList.remove(CLASS);
    }

    function prevent(e) {
      e.stopPropagation();
      e.preventDefault();
      return false;
    }

  }

  terminate() {
    let { terminator$, files$, text$ } = this;

    terminator$.next();
    terminator$.complete();

    files$.complete();

    text$.complete();

  }

  subscribe(subscriber) {
    let { terminator$, files$, ctrl$ } = this;
    ctrl$.pipe(takeUntil(terminator$)).subscribe((e) => this.drop(e));
    files$.pipe(takeUntil(terminator$)).subscribe(subscriber);
    return { unsubscribe: () => this.terminate() };
  }

  private drop(e) {

    let pos = {
      x: e.clientX,
      y: e.clientY
    };

    // text drop support
    let text = e.dataTransfer.getData('text');
    if (text) {
      this.text$.next({ text, pos });
    }

    // file drop
    if (e.dataTransfer.items) {
      // Handle directories in Chrome using the proprietary FileSystem API
      let items = ArrayUtils.toArray(e.dataTransfer.items).filter(item => item.kind === 'file');

      if (items.length === 0) {
        return;
      }

      forkJoin(
        ...items.map(item =>
          fromPromise(this.processEntry(item.webkitGetAsEntry()))
        )
      ).subscribe(results => {
        this.files$.next(flatten(results));
      });

    } else {

      let files = ArrayUtils.toArray(e.dataTransfer.files);

      if (files.length === 0) {
        return;
      }

      files.forEach(function (file) {
        file.fullPath = '/' + file.name;
      });

      this.files$.next(files);

    }

  }

  private processEntry(entry) {
    return new Promise((resolve, reject) => {
      if (entry.isFile) {
        entry.file(function (file) {
          file.fullPath = entry.fullPath;  // preserve pathing for consumer
          resolve(file);
        }, function (error) {
          reject(error);
        });
      } else if (entry.isDirectory) {

        let entries = [];
        const reader = entry.createReader();

        const doneEntries = () => {
          forkJoin(
            ...entries.map((_entry_) =>
              fromPromise(this.processEntry(_entry_)))
          ).subscribe({
            next(stuff) {
              console.log(stuff);
              resolve(stuff);
            },
            error(error) {
              reject(error);
            }
          });
        };

        const readEntries = () => {
          reader.readEntries(function (entries_) {
            if (entries_.length > 0) {
              entries = entries.concat(ArrayUtils.toArray(entries_));
              readEntries(); // continue reading entries until `readEntries` returns no more
            } else {
              doneEntries();
            }
          });
        };

        readEntries();

      }
    });

  }

}
