import { Subject } from 'rxjs/Subject';
import { NgRedux } from '@angular-redux/store';
import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { Asset } from '../../models/asset.model';
import { WithNgRedux } from '../../classes/with-ng-redux.class';
import { AppState } from '../../classes/app-state.interface';
import { notNullOrUndefined } from '../../app.utils';
import { filter, takeUntil } from 'rxjs/operators';
import { merge } from 'rxjs/observable/merge';

@Component({
  selector: 'std-info-sheet',
  templateUrl: './info-sheet.component.html',
  styleUrls: ['./info-sheet.component.scss']
})
export class InfoSheetComponent extends WithNgRedux implements OnChanges {

  @Input() id;

  asset: Asset;
  assetChanged$ = new Subject();

  constructor(store: NgRedux<AppState>) {
    super(store);
  }

  ngOnChanges(changes: SimpleChanges) {
    let { ngOnDestroy$, assetChanged$, id } = this;
    if (changes.id.previousValue !== changes.id.currentValue) {
      assetChanged$.next();
      if (notNullOrUndefined(id)) {
        this.select<Asset>(['entities', 'assets', 'byId', id])
          .pipe(
            filter(x => notNullOrUndefined(x)),
            takeUntil(merge(ngOnDestroy$, assetChanged$))
          )
          .subscribe(asset => this.asset = asset);
      }
    }
  }

}
