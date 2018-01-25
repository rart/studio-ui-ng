import {
  AfterContentInit,
  AfterViewInit,
  Component, ElementRef,
  OnChanges,
  OnDestroy,
  OnInit,
  SimpleChanges
} from '@angular/core';
import { NgRedux, Selector } from '@angular-redux/store';
import { AppState } from '../../classes/app-state.interface';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { AnyAction, Store } from 'redux';
import { filter, take } from 'rxjs/operators';

interface StudioPluginBundle {
  readonly tag: string; // 'div' | 'section' | 'span' | '...'
  readonly classes: string;

  [props: string]: any;

  create(node, host): StudioPlugin;
}

class StudioPluginHost {
  constructor(private store: Store<AppState>) {

  }

  getState(): AppState {
    return this.store.getState();
  }

  dispatch(action: AnyAction) {
    this.store.dispatch(action);
  }

  subscribe(subscriber: () => void) {
    return this.store.subscribe(subscriber);
  }

  select<T>(selector, comparator) {
    return (<NgRedux<AppState>>this.store).select<T>(selector, comparator);
  }
}

interface StudioPlugin {
  [props: string]: any;

  destroy(): void;
}

// class FormEditor implements StudioPlugin {}
const Bundle: StudioPluginBundle = {
  tag: 'div',
  classes: '',
  create: function (node, host) {

    let subscription;
    let updates = 0;

    let instance: StudioPlugin = {
      host: host,
      initialize() {
        subscription = host.subscribe(() => {
          updates++;
          this.render();
        });
      },
      destroy() {
        subscription();
        pretty('TEAL', 'Bye bye from plugin');
      },
      render() {
        let sessions = host.getState().editSessions.order.length;
        node.innerHTML = `
          <div class="pad lg all center text">
            <button class="mat-raised-button mat-icon-button mat-accent" color="accent" mat-raised-button mat-button>
              <span class="mat-button-wrapper">
                <i class="material-icons" role="img" aria-hidden="true">menu</i>
              </span>
            </button>
            <h2>Hello, plugin world!</h2>
            <div>You have currently ${sessions} active sessions</div>
            <div class="muted text">I've received ${updates} update(s).</div>
          </div>
        `;
        $(node).find('button').click(() => {
          host.dispatch({ type: 'TOGGLE_SIDEBAR' });
        });
      }
    };

    instance.initialize();
    instance.render();

    return instance;

  }
};

@Component({
  selector: 'std-plugin-host',
  templateUrl: './plugin-host.component.html',
  styleUrls: ['./plugin-host.component.scss']
})
export class PluginHostComponent
  implements OnChanges, OnInit, AfterContentInit, AfterViewInit, OnDestroy {

  loading$ = new BehaviorSubject(true);

  private host: StudioPluginHost;
  private bundle: StudioPluginBundle;
  private instance: StudioPlugin;

  constructor(store: NgRedux<AppState>,
              private elementRef: ElementRef) {
    this.host = new StudioPluginHost(store);
    requirejs([], (/*bundle*/) => {
      this.bundle = Bundle;
      this.loading$.next(false);
    });
  }

  get elem() {
    return this.elementRef.nativeElement;
  }

  ngOnInit() {
    this.loading$
      .pipe(
        filter(x => !x),
        take(1)
      )
      .subscribe(() => {
        try {
          let { elem, host, bundle } = this;
          let instance, node;

          node = document.createElement(bundle.tag || 'div');
          node.className = bundle.classes || '';

          elem.appendChild(node);
          instance = bundle.create(node, host);

          this.instance = instance;
        } catch (e) {
          console.error('The plugin bundle produced an error during initialization', e);
        }
      });
  }

  ngOnChanges(changes: SimpleChanges): void {

  }

  ngAfterContentInit(): void {

  }

  ngAfterViewInit(): void {

  }

  ngOnDestroy(): void {
    try {
      this.instance.destroy();
    } catch (e) {
      console.error('The plugin bundle produced an error during disposing', e);
    }
  }

}
