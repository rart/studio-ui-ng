import { Component, ContentChild, HostBinding, Input, OnChanges, OnInit, Output, TemplateRef } from '@angular/core';
import { AssetActionEnum, AssetMenuOption, WorkflowService } from '../../services/workflow.service';
import { WithNgRedux } from '../../classes/with-ng-redux.class';
import { Asset } from '../../models/asset.model';
import { NgRedux, select } from '@angular-redux/store';
import { AppState, LookUpTable, Settings } from '../../classes/app-state.interface';
import { AssetActions } from '../../actions/asset.actions';
import { Router } from '@angular/router';
import { notNullOrUndefined } from '../../app.utils';
import { Subscription } from 'rxjs/Subscription';
import { isNullOrUndefined } from 'util';
import { SettingsEnum } from '../../enums/Settings.enum';
import { createPreviewTabCore } from '../../utils/state.utils';
import { Subject } from 'rxjs/Subject';
import { takeUntil } from 'rxjs/operators';
import { PreviewTabsActions } from '../../actions/preview-tabs.actions';

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

  settings: Settings;

  ngOnChanges$ = new Subject();

  @Input() ids: string[] = null;
  assetsLookUpTable: LookUpTable<Asset>;
  selected: LookUpTable<boolean>;

  menu: AssetMenuOption[] = [];
  mode: 'single' | 'multi' = null;

  constructor(store: NgRedux<AppState>,
              private workflowService: WorkflowService,
              private assetActions: AssetActions,
              private router: Router,
              private previewTabsActions: PreviewTabsActions) {
    super(store);

    store.select<Settings>('settings')
      .pipe(this.untilDestroyed())
      .subscribe(x => this.settings = x);

  }

  ngOnChanges() {
    this.ngOnChanges$.next();
    if (notNullOrUndefined(this.ids)) {
      if (this.ids.length > 1) {
        this.selected = this.ids.reduce((prev, current) => {
          prev[current] = true;
          return prev;
        }, {});
        this.menu = this.workflowService
          .getAvailableWorkflowOptions(this.state.user, this.selected);
      } else {
        this.selected = { [`${this.ids[0]}`]: true };
        this.menu = this.workflowService
          .getAvailableAssetOptions(this.state.user, this.ids[0]);
      }
    } else {
      this.pipeFilterAndTakeUntil(
        this.store.select(['workspaceRef', 'selectedItems']),
        takeUntil(this.ngOnChanges$))
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
      .pipe(this.untilDestroyed())
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

  menuItemSelected(action, $event) {
    this.handleAction(action, $event);
  }

  handleAction(action, $event) {

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

      case AssetActionEnum.PREVIEW: {

        let { settings } = this;
        let tabs = [];

        array.forEach(id => {
          asset = lookup[id];
          tabs.push(createPreviewTabCore({
            url: asset.url,
            projectCode: asset.projectCode,
            title: asset.label,
            assetId: asset.id
          }));
        });

        this.dispatch(
          (singleMode)
            ? ($event.metaKey)
              ? settings.metaClickOpenTabInBackground
                ? this.previewTabsActions.openInBackground(tabs[0])
                : this.previewTabsActions.open(tabs[0])
              : this.previewTabsActions.nav(tabs[0])
            : settings.metaClickOpenTabInBackground && $event.metaKey
              ? this.previewTabsActions.openManyInBackground(tabs)
              : this.previewTabsActions.openMany(tabs)
        );

        break;
      }

      case AssetActionEnum.INFO:
      case AssetActionEnum.DELETE:
      case AssetActionEnum.HISTORY:
      case AssetActionEnum.PUBLISH:
      case AssetActionEnum.SCHEDULE:
      case AssetActionEnum.DEPENDENCIES:
        let projectCode = this.store.getState().activeProjectCode;
        this.router.navigate(['/project/',
          ...(singleMode
            ? [projectCode, 'review', /*asset.id*/'uuid']
            : [projectCode, 'review', 'selected']),
          action.toLowerCase()
        ]);
        break;

    }

  }

}
