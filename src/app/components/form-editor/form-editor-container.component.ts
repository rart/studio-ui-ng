import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { Asset } from '../../models/asset.model';
import { filter, take, takeUntil } from 'rxjs/operators';
import { notNullOrUndefined } from '../../app.utils';
import { AssetTypeEnum } from '../../enums/asset-type.enum';
import { WithNgRedux } from '../../classes/with-ng-redux.class';
import { NgRedux } from '@angular-redux/store';
import { AppState } from '../../classes/app-state.interface';

@Component({
  selector: 'std-form-editor-container',
  templateUrl: './form-editor-container.component.html',
  styleUrls: ['./form-editor-container.component.scss']
})
export class FormEditorContainerComponent extends WithNgRedux implements OnInit, OnChanges {

  @Input() assetId: string;

  asset: Asset = null;

  constructor(store: NgRedux<AppState>) {
    super(store);
  }

  ngOnInit() {

  }

  ngOnChanges({ assetId }: SimpleChanges) {
    if (assetId && (assetId.previousValue !== assetId.currentValue)) {
      this.select<Asset>([
        'entities', 'assets', 'byId', assetId.currentValue
      ]).pipe(
        filter(x => notNullOrUndefined(x)),
        take(1),
        takeUntil(this.ngOnDestroy$)
      ).subscribe((asset) => {
        this.asset = asset;
      });
    }
  }

}
