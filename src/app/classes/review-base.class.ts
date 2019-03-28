import { ComponentBase } from './component-base.class';
import { ActivatedRoute } from '@angular/router';
import { NgRedux } from '@angular-redux/store';
import { AppState } from './app-state.interface';
import { BehaviorSubject } from 'rxjs';

export class ReviewBase extends ComponentBase {

  data;
  empty = false;
  loading = false;
  finished = false;

  ids$: BehaviorSubject<string[]> = new BehaviorSubject([]);

  constructor(store: NgRedux<AppState>, route: ActivatedRoute) {
    super();

    route.parent.params
      .subscribe((params) => {
        if (params.asset === 'selected') {
          store.select(['workspaceRef', 'selectedItems'])
            .pipe(this.untilDestroyed())
            .subscribe((selected) => {
              this.ids$.next(Object.keys(selected));
            });
        } else {
          this.ids$.next(['editorial:/site/website/index.xml']); // [params.asset];
        }
      });

    this.ids$
      .pipe(this.untilDestroyed())
      .subscribe(ids => {
        this.empty = !ids.length;
      });

  }

}
