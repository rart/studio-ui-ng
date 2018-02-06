import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Input,
  OnChanges,
  SimpleChanges
} from '@angular/core';
import { Router } from '@angular/router';
import { AppState } from '../../classes/app-state.interface';
import { PreviewTabsActions } from '../../actions/preview-tabs.actions';
import { NgRedux } from '@angular-redux/store';
import { AssetActions } from '../../actions/asset.actions';
import { AssetDisplayComponent } from './asset-display.component';
import { Asset } from '../../models/asset.model';

@Component({
  selector: 'std-asset-display',
  templateUrl: './asset-display.component.html',
  styleUrls: ['./asset-display.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SimpleAssetDisplayComponent extends AssetDisplayComponent implements OnChanges {

  @Input() asset: Asset;

  constructor(store: NgRedux<AppState>,
              router: Router,
              assetActions: AssetActions,
              previewTabsActions: PreviewTabsActions,
              detector: ChangeDetectorRef) {
    super(
      store,
      router,
      assetActions,
      previewTabsActions,
      detector);
  }

  ngOnChanges(changes: SimpleChanges) {
    let { ngOnChanges$ } = this;
    ngOnChanges$.next(changes);

    this.setMenuVisibility();
    this.setLabelLeftClear();
    this.setIsNavigable();
    this.setIconDescription();
    this.setLockedByCurrent();
    this.setTypeClass();
    this.setStatusClass();
    this.setLabel();

  }

}
