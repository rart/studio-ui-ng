import { Component } from '@angular/core';
import { AppState, ExplorerState, LookupTable } from '../../classes/app-state.interface';
import { dispatch, NgRedux, select } from '@angular-redux/store';
import { ComponentBase } from '../../classes/component-base.class';
import { Asset } from '../../models/asset.model';
import { ExplorerActions } from '../../actions/explorer.actions';
import { isNullOrUndefined } from 'util';
import { notNullOrUndefined } from '../../app.utils';

@Component({
  selector: 'std-asset-browser',
  templateUrl: './asset-browser.component.html',
  styleUrls: ['./asset-browser.component.scss']
})
export class AssetBrowserComponent extends ComponentBase {

  tree = {};
  paths = [];
  selectedAsset: string;

  @select(['entities', 'assets', 'byId'])
  assets$: LookupTable<Asset>;

  constructor(store: NgRedux<AppState>) {
    super();

    // If there's no active explorer project but there's a active project
    // pick that site as the explorer's active project too
    let state = store.getState();
    let explorerState = state.explorer;
    if (isNullOrUndefined(explorerState.activeProjectCode)
      && notNullOrUndefined(state.activeProjectCode)) {
      store.dispatch(ExplorerActions.selectProject(state.activeProjectCode));
    }

    this.pipeFilterAndTakeUntil(
      store.select<ExplorerState>(['explorer']))
      .subscribe((explorer) => {
        let container = explorer.byProject[explorer.activeProjectCode];
        if (notNullOrUndefined(container.paths)) {
          this.paths = container.paths;
        }
        this.selectedAsset = container.asset;
      });

  }

  @dispatch()
  selectionChange(item: Asset) {
    return ExplorerActions.selectAsset(item);
  }

  directoryTracker(index, path) {
    return path;
  }

  search(query) {
    console.log(query);
  }

}


