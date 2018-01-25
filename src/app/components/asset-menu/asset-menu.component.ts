import { Component, ContentChild, HostBinding, Input, OnChanges, OnInit, Output, TemplateRef } from '@angular/core';
import { AssetActionEnum, AssetMenuOption, WorkflowService } from '../../services/workflow.service';
import { WithNgRedux } from '../../classes/with-ng-redux.class';
import { Asset } from '../../models/asset.model';
import { NgRedux, select } from '@angular-redux/store';
import { AppState, LookUpTable } from '../../classes/app-state.interface';
import { Subject } from 'rxjs/Subject';
import { AssetActions } from '../../actions/asset.actions';
import { Router } from '@angular/router';
import { PreviewTabsActions } from '../../actions/preview-tabs.actions';
import { notNullOrUndefined } from '../../app.utils';
import { Subscription } from 'rxjs/Subscription';
import { isNullOrUndefined } from 'util';
import { Observable } from 'rxjs/Observable';

@Component({
  selector: 'std-asset-menu',
  templateUrl: './asset-menu.component.html',
  styleUrls: ['./asset-menu.component.scss']
})
export class AssetMenuComponent extends WithNgRedux implements OnInit, OnChanges {

  @HostBinding('style.display') get display() {
    return (this.menu.length === 0) ? 'none' : null;
  }

  @ContentChild('buttonTemplate') template: TemplateRef<any>;

  sub: Subscription;

  @Input() asset: Asset = null;
  assetsLookUpTable: LookUpTable<Asset>;
  selected: LookUpTable<boolean>;

  menu: AssetMenuOption[] = [];
  mode: 'single' | 'multi' = null;

  constructor(store: NgRedux<AppState>,
              private workflowService: WorkflowService,
              private assetActions: AssetActions,
              private router: Router) {
    super(store);
  }

  ngOnChanges() {
    if (notNullOrUndefined(this.sub)) {
      this.sub.unsubscribe();
    }
    if (notNullOrUndefined(this.asset)) {
      this.selected = { [this.asset.id]: true };
      this.menu = this.workflowService
        .getAvailableAssetOptions(this.state.user, this.asset);
    } else {
      this.sub = this.store.select(['workspaceRef', 'selectedItems'])
        .pipe(...this.noNullsAndUnSubOps)
        .subscribe((assets: LookUpTable<boolean>) => {
          this.selected = assets;
          this.menu = this.workflowService
            .getAvailableWorkflowOptions(this.state.user, assets);
        });
    }
  }

  ngOnInit() {

    this
      .select(['entities', 'assets', 'byId'])
      .pipe(this.endWhenDestroyed)
      .subscribe((assetTable: LookUpTable<Asset>) => {
        this.assetsLookUpTable = assetTable;
      });

    if (isNullOrUndefined(this.mode)) {
      // When no input provided, ngOnChanges is not called.
      // (and that's where I'm doing the initialization)
      this.ngOnChanges();
    }

  }

  menuButtonClicked($event: Event) {
    $event.stopPropagation();
  }

  menuItemSelected(action) {
    this.handleAction(action);
  }

  handleAction(action) {

    let
      lookup = this.assetsLookUpTable,
      array = Object.keys(this.selected),
      singleMode = (array.length === 1),
      asset = singleMode ? lookup[array[0]] : null;

    switch (action) {

      case AssetActionEnum.EDIT:
        if (singleMode) {
          this.dispatch(
            this.assetActions.edit(
              asset.projectCode,
              asset.id));
        } else {
          this.dispatch(
            this.assetActions.editMany(
              array.map(
                id => ({
                  projectCode: lookup[id].projectCode,
                  assetId: lookup[id].id
                }))));
        }
        break;

      case AssetActionEnum.PREVIEW:

        break;

      case AssetActionEnum.INFO:
      case AssetActionEnum.DELETE:
      case AssetActionEnum.HISTORY:
      case AssetActionEnum.APPROVE:
      case AssetActionEnum.SCHEDULE:
      case AssetActionEnum.DEPENDENCIES:
        this.router.navigate([
          '/project/',
          ...(singleMode
            ? ['manage', asset.projectCode, asset.id.replace(`${asset.projectCode}:`, '')]
            : [this.store.getState().activeProjectCode, 'manage-selection'])
        ]);
        break;

    }

  }

}
