import { Component, ContentChild, HostBinding, Input, OnChanges, OnInit, Output, TemplateRef } from '@angular/core';
import { AssetActionEnum, AssetMenuOption, WorkflowService } from '../../services/workflow.service';
import { WithNgRedux } from '../../classes/with-ng-redux.class';
import { Asset } from '../../models/asset.model';
import { NgRedux } from '@angular-redux/store';
import { AppState } from '../../classes/app-state.interface';
import { Subject } from 'rxjs/Subject';
import { AssetActions } from '../../actions/asset.actions';
import { Router } from '@angular/router';
import { PreviewTabsActions } from '../../actions/preview-tabs.actions';
import { notNullOrUndefined } from '../../app.utils';
import { Subscription } from 'rxjs/Subscription';
import { isNullOrUndefined } from 'util';

@Component({
  selector: 'std-asset-menu',
  templateUrl: './asset-menu.component.html',
  styleUrls: ['./asset-menu.component.scss']
})
export class AssetMenuComponent extends WithNgRedux implements OnInit, OnChanges {

  @HostBinding('style.display') get display() {
    return (this.menu.length === 0) ? 'none' : null;
  }

  @Input() asset: Asset = null;
  @ContentChild('buttonTemplate') template: TemplateRef<any>;
  @Output() selection = new Subject();

  sub: Subscription;

  assets: Asset[];

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
      this.mode = 'single';
      this.menu = this.workflowService
        .getAvailableAssetOptions(this.state.user, this.asset);
    } else {
      this.mode = 'multi';
      this.sub = this.store.select(['workspaceRef', 'selectedItems'])
        .pipe(...this.noNullsAndUnSubOps)
        .subscribe((assets: Asset[]) => {
          this.assets = assets;
          this.menu = this.workflowService
            .getAvailableWorkflowOptions(this.state.user, assets);
        });
    }
  }

  ngOnInit() {
    if (isNullOrUndefined(this.mode)) {
      // When no input provided, ngOnChanges is not called.
      this.ngOnChanges();
    }
  }

  menuButtonClicked($event: Event) {
    $event.stopPropagation();
  }

  menuItemSelected(action) {
    this.selection.next(action);
    this.handleAction(action);
  }

  handleAction(action) {

    let
      assets = this.assets,
      singleMode = (this.mode === 'single');

    switch (action) {

      case AssetActionEnum.EDIT:
        if (singleMode) {
          let asset = assets[0];
          this.dispatch(
            this.assetActions.edit(
              asset.projectCode,
              asset.id));
        } else {
          this.dispatch(
            this.assetActions.editMany(
              assets.map(
                asset => ({
                  projectCode: asset.projectCode,
                  assetId: asset.id
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
        this.router.navigate(singleMode ? ['manage', assets[0].id] : ['manage-selection']);
        break;

    }

  }

}
