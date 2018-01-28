import { ComponentBase } from './component-base.class';
import { ActivatedRoute } from '@angular/router';
import { NgRedux } from '@angular-redux/store';
import { AppState } from './app-state.interface';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';

export class ReviewBase extends ComponentBase {

  ids$: BehaviorSubject<string[]> = new BehaviorSubject([]);

  constructor(store: NgRedux<AppState>, protected route: ActivatedRoute) {
    super();

    route.parent.params
      .subscribe((params) => {
        if (params.asset === 'selected') {
          store.select(['workspaceRef', 'selectedItems'])
            .pipe(this.endWhenDestroyed)
            .subscribe((selected) => {
              this.ids$.next(Object.keys(selected));
            });
        } else {
          this.ids$.next(['launcher:/site/website/index.xml']); // [params.asset];
        }
      });

  }

}
