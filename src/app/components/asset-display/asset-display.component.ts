import {
  Component, EventEmitter,
  HostBinding,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  Output,
  SimpleChanges
} from '@angular/core';
import { Router } from '@angular/router';
import { AppState, Settings } from '../../classes/app-state.interface';
import { Asset } from '../../models/asset.model';
import { StringUtils } from '../../utils/string.utils';
import { AssetTypeEnum } from '../../enums/asset-type.enum';
import { CommunicationService } from '../../services/communication.service';
import { AssetActionEnum, AssetMenuOption, WorkflowService } from '../../services/workflow.service';
import { SelectedItemsActions } from '../../actions/selected-items.actions';
import { PreviewTabsActions } from '../../actions/preview-tabs.actions';
import { dispatch, NgRedux } from '@angular-redux/store';
import { WithNgRedux } from '../../classes/with-ng-redux.class';
import { createPreviewTabCore } from '../../utils/state.utils';
import { SettingsEnum } from '../../enums/Settings.enum';
import { AssetActions } from '../../actions/asset.actions';
import { notNullOrUndefined } from '../../app.utils';
import { skip, tap } from 'rxjs/operators';
import { isNullOrUndefined } from 'util';

@Component({
  selector: 'std-asset-display',
  templateUrl: './asset-display.component.html',
  styleUrls: ['./asset-display.component.scss']
})
export class AssetDisplayComponent extends WithNgRedux implements OnInit, OnChanges, OnDestroy {

  constructor(store: NgRedux<AppState>,
              private workflowService: WorkflowService,
              private communicationService: CommunicationService,
              private router: Router,
              private assetActions: AssetActions,
              private previewTabsActions: PreviewTabsActions) {
    // Init Store
    super(store);
  }

  asset: Asset;
  settings: Settings;

  @Input() id: string;
  @Input() disallowWrap = true;
  @Input() showCheck = false;
  @Input() showIcons = true;
  @Input() showTypeIcon = true;
  @Input() showStatusIcons = true;
  @Input() showMenu: boolean | 'hover' | 'true' | 'false' = 'hover';
  @Input() showLabel = true;
  @Input() showLink = true; // Asset renders as a link when 'previewable'
  @Input() displayField: keyof Asset = 'label';

  @Output() action = new EventEmitter();

  // https://stackoverflow.com/questions/45313939/data-binding-causes-expressionchangedafterithasbeencheckederror
  // https://stackoverflow.com/questions/46065535/expressionchangedafterithasbeencheckederror-in-two-way-angular-binding
  // https://angular.io/guide/template-syntax
  // @Output() showIconsChange = new EventEmitter();

  assetSub;
  selectedAssetsSub;

  @HostBinding('class.no-wrap')
  get wrapDisallowed() {
    return this.disallowWrap;
  }

  @HostBinding('class.hover-menu')
  get hoverMenu() {
    return this.showMenu === 'hover';
  }

  @HostBinding('class.label-left-clear')
  get labelLeftClear() {
    return (!this.showCheck && !this.showIcons);
  }

  // TODO: i18n
  get iconDescription() {
    let
      type,
      status,
      asset = this.asset;
    type = StringUtils.capitalize(
      asset
        .type
        .replace(/_/g, ' ')
        .toLowerCase());
    status = StringUtils.capitalize(
      asset
        .workflowStatus
        .replace('WITH_WF', 'with workflow')
        .replace(/_/g, ', ')
        .toLowerCase());
    if (asset.locked) {
      return `${type}. ${status} by ${this.lockedByCurrent ? 'you' : asset.lockedBy.name}.`;
    } else {
      return `${type}. ${status}.`;
    }
  }

  get lockedByCurrent() {
    return this.state.user.username === this.asset.lockedBy.username;
  }

  get typeClass() {
    return this.asset
      .type
      .toLowerCase()
      .replace(/_/g, ' ');
  }

  get statusClass() {
    return this.asset
      .workflowStatus
      .toLowerCase()
      .replace(/_/g, ' ');
  }

  get label() {

    let label,
      displayField = this.displayField;

    if (!(displayField in this.asset)) {
      console.log('Incorrect field ' + displayField + ' supplied. Using "label".');
      displayField = 'label';
    }

    label = this.asset[displayField];
    switch (this.displayField) {
      case 'label':
        return (label === 'crafter-level-descriptor.level.xml')
          ? 'Section Defaults'
          : this.asset.label;
      default:
        return label;
    }

  }

  navigable = true; // Internal control of whether the asset displays as a link or a label
  selected = false;

  // internal compiled value of the @input showmenu
  // updated every ngOnChanges
  shouldShowMenu = this.showMenu;

  ngOnInit() {
    this.select('settings')
      .pipe(this.endWhenDestroyed)
      .subscribe((x: Settings) => this.settings = x);
  }

  ngOnChanges(ngChanges: SimpleChanges) {

    let changes: any = { ...ngChanges };
    let stub = { previousValue: null, currentValue: null, firstChange: null };
    if (isNullOrUndefined(changes.id)) {
      changes.id = stub;
    }
    if (isNullOrUndefined(changes.showCheck)) {
      changes.showCheck = stub;
    }

    if (this.showMenu === 'true') {
      this.shouldShowMenu = true;
    } else if (this.showMenu === 'false') {
      this.shouldShowMenu = false;
    } else if (this.showMenu === 'hover') {
      this.shouldShowMenu = true;
    } else {
      // by this point, showMenu should be a boolean
      this.shouldShowMenu = this.showMenu;
    }

    if (changes.id.previousValue !== changes.id.currentValue) {
      if (notNullOrUndefined(this.assetSub)) {
        this.assetSub.unsubscribe();
        this.assetSub = null;
      }
      this.assetSub = this.select(['entities', 'assets', 'byId', this.id])
      // right now, skipping the first since the asset will
      // always be pre-loaded by the host component. Probably
      // should change in the future
        .pipe(this.endWhenDestroyed)
        .subscribe((a: Asset) => {
          this.asset = a;
          this.navigable = this.isNavigable();
        });
    }

    if (changes.showCheck.previousValue !== changes.showCheck.currentValue) {
      // Only good as far as there's a single subscription...
      if (notNullOrUndefined(this.selectedAssetsSub)) {
        this.selectedAssetsSub.unsubscribe();
        this.selectedAssetsSub = null;
      }
      if (this.showCheck) {
        this.selectedAssetsSub = this.store.select(['workspaceRef', 'selectedItems'])
          .pipe(this.endWhenDestroyed)
          .subscribe(selectedItems => this.selectedItemsStateChanged(selectedItems));
      }
    }

  }

  isNavigable() {
    if (!this.showLink) {
      return false;
    }
    switch (this.asset.type) {
      case AssetTypeEnum.FOLDER:
      case AssetTypeEnum.COMPONENT:
      case AssetTypeEnum.LEVEL_DESCRIPTOR:
        return false;
      default:
        return true;
    }
  }

  @dispatch()
  navigate($event) {
    let
      { asset, settings } = this,
      tab = createPreviewTabCore({
        url: asset.url,
        projectCode: asset.projectCode,
        title: asset.label,
        assetId: asset.id
      });
    if ($event.metaKey) {
      return settings[SettingsEnum.CLICK_WITH_META_OPENS_TAB_IN_BACKGROUND]
        ? this.previewTabsActions.openInBackground(tab)
        : this.previewTabsActions.open(tab);
    } else {
      return this.previewTabsActions.nav(tab);
    }
  }

  @dispatch()
  checkedStateChange(checked) {
    return checked
      ? SelectedItemsActions.select(this.asset.id, this.asset.projectCode)
      : SelectedItemsActions.deselect(this.asset.id, this.asset.projectCode);
  }

  private selectedItemsStateChanged(selectedItems) {
    let checked = Object.keys(selectedItems);
    this.selected = checked.includes(this.asset.id);
  }

}
