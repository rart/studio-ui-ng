import { AfterContentInit, AfterViewInit, Component, ElementRef, Input, OnChanges, OnDestroy, OnInit, SimpleChanges } from '@angular/core';
import { NgRedux } from '@angular-redux/store';
import { AppState } from '../../classes/app-state.interface';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { filter, takeUntil } from 'rxjs/operators';
import { StudioPluginHost } from '../../classes/studio-plugin';
import { StudioPlugin } from '../../models/studio-plugin';
import { Subject } from 'rxjs/Subject';

@Component({
  selector: 'std-plugin-host',
  templateUrl: './plugin-host.component.html',
  styleUrls: ['./plugin-host.component.scss']
})
export class PluginHostComponent
  implements OnChanges, OnInit, AfterContentInit, AfterViewInit, OnDestroy {

  @Input() plugin: string;

  loading$ = new BehaviorSubject(true);

  private host: StudioPluginHost;
  private bundle: StudioPlugin;
  private ngOnDestroy$: Subject<any> = new Subject();

  constructor(store: NgRedux<AppState>,
              private elementRef: ElementRef) {
    this.host = new StudioPluginHost(store);
  }

  get elem() {
    return this.elementRef.nativeElement;
  }

  ngOnInit() {
    const { loading$, ngOnDestroy$ } = this;
    loading$
      .pipe(
        filter(x => !x),
        takeUntil(ngOnDestroy$)
      )
      .subscribe(() => {
        try {
          let { elem, host, bundle } = this;
          let node;

          node = document.createElement(bundle.tag || 'div');
          node.className = bundle.classes || '';

          elem.appendChild(node);
          bundle.create(node, host);

        } catch (e) {
          console.error('The plugin bundle produced an error during initialization', e);
        }
      });
  }

  ngOnChanges({ plugin }: SimpleChanges): void {
    if (plugin && plugin.firstChange || (plugin.currentValue !== plugin.previousValue)) {
      const { bundle, loading$ } = this;

      loading$.next(true);
      if (bundle && bundle.destroy) {
        bundle.destroy();
      }

      requirejs([`plugins/${this.plugin}`], (nextBundle) => {
        this.bundle = nextBundle;
        loading$.next(false);
      });
    }
  }

  ngAfterContentInit(): void {

  }

  ngAfterViewInit(): void {

  }

  ngOnDestroy(): void {
    try {
      this.bundle.destroy();
    } catch (e) {
      console.error('The plugin bundle produced an error during disposing', e);
    }
  }

}
