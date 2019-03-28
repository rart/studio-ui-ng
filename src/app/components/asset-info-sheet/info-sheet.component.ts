import { Subject ,  merge } from 'rxjs';
import { NgRedux } from '@angular-redux/store';
import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { Asset } from '../../models/asset.model';
import { WithNgRedux } from '../../classes/with-ng-redux.class';
import { AppState } from '../../classes/app-state.interface';
import { fullName, notNullOrUndefined } from '../../app.utils';
import { filter, takeUntil } from 'rxjs/operators';
import { TranslateService } from '@ngx-translate/core';
import * as moment from 'moment';

// under systemjs, moment is actually exported as the default export, so we account for that
const m: (value?: any) => moment.Moment = (<any>moment).default || moment;

@Component({
  selector: 'std-info-sheet',
  templateUrl: './info-sheet.component.html',
  styleUrls: ['./info-sheet.component.scss']
})
export class InfoSheetComponent extends WithNgRedux implements OnChanges {

  @Input() id;
  @Input() showGeneral = true;
  @Input() showPermissions = true;
  @Input() closed = { general: false, permissions: false };

  asset: Asset;
  assetChanged$ = new Subject();

  properties = [];

  constructor(store: NgRedux<AppState>,
              private translate: TranslateService) {
    super(store);
  }

  ngOnChanges(changes: SimpleChanges) {
    let { ngOnDestroy$, assetChanged$, translate, id } = this;
    if (changes.id.previousValue !== changes.id.currentValue) {
      assetChanged$.next();
      if (notNullOrUndefined(id)) {
        let now = (key, interpolate?) => translate.instant(key, interpolate);
        this.select<Asset>(['entities', 'assets', 'byId', id])
          .pipe(
            filter(x => notNullOrUndefined(x)),
            takeUntil(merge(ngOnDestroy$, assetChanged$))
          )
          .subscribe(asset => {
            this.asset = asset;
            this.properties = [
              { label: now('Type'), value: asset.type },
              { label: now('Children'), value: asset.numOfChildren ? now('Yes ({{num}})', { num: asset.numOfChildren }) : 'No' },
              { label: now('Url'), value: asset.url },
              { label: now('State'), value: asset.workflowStatus },
              asset.lastEditedOn ? { label: now('Last Edit On'), value: m(<any>asset.lastEditedOn).from(m()) } : null,
              asset.lastEditedBy ? { label: now('Last Edit by'), value: fullName(asset.lastEditedBy) } : null,
              asset.contentModelId ? { label: now('Content Model'), value: asset.contentModelId } : null,
              asset.publishedOn ? { label: now('Published on'), value: m(<any>asset.publishedOn).from(m()) } : null
            ].filter(x => notNullOrUndefined(x));
          });
      }
    }
  }

}
