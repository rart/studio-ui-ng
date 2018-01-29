import {
  Component,
  EventEmitter,
  HostBinding,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  Output,
  SimpleChanges
} from '@angular/core';
import { Router } from '@angular/router';
import { AppState, LookupTable, Settings } from '../../classes/app-state.interface';
import { Asset } from '../../models/asset.model';
import { StringUtils } from '../../utils/string.utils';
import { AssetTypeEnum } from '../../enums/asset-type.enum';
import { CommunicationService } from '../../services/communication.service';
import { WorkflowService } from '../../services/workflow.service';
import { SelectedItemsActions } from '../../actions/selected-items.actions';
import { PreviewTabsActions } from '../../actions/preview-tabs.actions';
import { dispatch, NgRedux } from '@angular-redux/store';
import { WithNgRedux } from '../../classes/with-ng-redux.class';
import { createPreviewTabCore } from '../../utils/state.utils';
import { SettingsEnum } from '../../enums/Settings.enum';
import { AssetActions } from '../../actions/asset.actions';
import { notNullOrUndefined } from '../../app.utils';
import { filter, withLatestFrom } from 'rxjs/operators';
import { isNullOrUndefined } from 'util';
import { ReplaySubject } from 'rxjs/ReplaySubject';

declare type LabelFactory = (asset: Asset) => string;

let count = 0;

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

  count = count++;

  asset: Asset;
  settings: Settings;

  asset$ = new ReplaySubject<Asset>();

  @Input() id: string;
  @Input() @HostBinding('class.no-wrap') disallowWrap = true;
  @Input() showCheck = false;
  @Input() showIcons = true;
  @Input() showTypeIcon = true;
  @Input() showStatusIcons = true;
  @Input() showMenu: boolean | 'hover' | 'true' | 'false' = 'hover';
  @Input() showLabel = true;
  @Input() showLink = true; // Asset renders as a link when 'previewable'
  @Input() displayField: keyof Asset = 'label';
  @Input() checkMode: 'state' | 'local' = 'state';
  @Input() labelFactory: LabelFactory;

  @Input () checked = false;
  @Output() checkedChange = new EventEmitter();

  // https://stackoverflow.com/questions/45313939/data-binding-causes-expressionchangedafterithasbeencheckederror
  // https://stackoverflow.com/questions/46065535/expressionchangedafterithasbeencheckederror-in-two-way-angular-binding
  // https://angular.io/guide/template-syntax
  // @Output() showIconsChange = new EventEmitter();

  assetSub;
  selectedAssetsSub;

  label;
  statusClass;
  typeClass;
  lockedByCurrent;
  iconDescription;
  @HostBinding('class.label-left-clear')
  labelLeftClear;
  @HostBinding('class.hover-menu')
  hoverMenu;

  navigable = true; // Internal control of whether the asset displays as a link or a label
  selected = false;

  // internal compiled value of the @input showmenu
  // updated every ngOnChanges
  shouldShowMenu = false;

  ngOnInit() {
    this.select('settings')
      .pipe(this.untilDestroyed())
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
    if (isNullOrUndefined(changes.checkMode)) {
      changes.checkMode = stub;
    }

    this.setMenuVisibility();
    this.setLabelLeftClear();

    if (changes.id.previousValue !== changes.id.currentValue) {
      if (notNullOrUndefined(this.assetSub)) {
        this.assetSub.unsubscribe();
        this.assetSub = null;
      }
      if (notNullOrUndefined(this.id)) {
        this.assetSub = this.select<Asset>(['entities', 'assets', 'byId', this.id])
          .pipe(
            filter(x => notNullOrUndefined(x)),
            this.untilDestroyed()
          )
          .subscribe(asset => {

            this.asset = asset;
            this.asset$.next(asset);

            this.setIsNavigable();
            this.setIconDescription();
            this.setLockedByCurrent();
            this.setTypeClass();
            this.setStatusClass();
            this.setLabel();

          });
      }
    }

    if (changes.showCheck.previousValue !== changes.showCheck.currentValue ||
      changes.checkMode.previousValue !== changes.checkMode.currentValue) {
      if (notNullOrUndefined(this.selectedAssetsSub)) {
        this.selectedAssetsSub.unsubscribe();
        this.selectedAssetsSub = null;
      }
      if (this.showCheck && this.checkMode === 'state') {
        this.selectedAssetsSub = this.store.select<LookupTable<boolean>>(['workspaceRef', 'selectedItems'])
          .pipe(
            withLatestFrom(this.asset$, x => x),
            this.untilDestroyed()
          )
          .subscribe(selectedItems => this.selectedItemsStateChanged(selectedItems));
      }
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
  selectedStateChange(checked) {
    if (this.checkMode === 'state') {
      return checked
        ? SelectedItemsActions.select(this.asset.id, this.asset.projectCode)
        : SelectedItemsActions.deselect(this.asset.id, this.asset.projectCode);
    } else {
      return false;
    }
  }

  checkedStateChange(checked) {
    this.checkedChange.next(checked);
  }

  private setIsNavigable() {
    if (!this.showLink) {
      this.navigable = false;
      return;
    }
    switch (this.asset.type) {
      case AssetTypeEnum.FOLDER:
      case AssetTypeEnum.COMPONENT:
      case AssetTypeEnum.LEVEL_DESCRIPTOR:
        this.navigable = false;
        break;
      default:
        this.navigable = true;
    }
  }

  private setMenuVisibility() {
    this.hoverMenu = (this.showMenu === 'hover');
    this.shouldShowMenu = ((typeof this.showMenu === 'boolean')
      ? this.showMenu
      : (<boolean>{
        'true': true,
        'false': false,
        'hover': true
      }[this.showMenu]));
  }

  private setLabelLeftClear() {
    this.labelLeftClear = (!this.showCheck && !this.showIcons);
  }

  // TODO: i18n
  private setIconDescription() {
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
      this.iconDescription = `${type}. ${status} by ${this.lockedByCurrent ? 'you' : asset.lockedBy.name}.`;
    } else {
      this.iconDescription = `${type}. ${status}.`;
    }
  }

  private setLockedByCurrent() {
    this.lockedByCurrent = (notNullOrUndefined(this.asset.lockedBy)
      ? (this.state.user.username === this.asset.lockedBy.username)
      : false);
  }

  private setTypeClass() {
    this.typeClass = this.asset
      .type
      .toLowerCase()
      .replace(/_/g, ' ');
  }

  private setStatusClass() {
    this.statusClass = this.asset
      .workflowStatus
      .toLowerCase()
      .replace(/_/g, ' ');
  }

  private setLabel() {

    if (notNullOrUndefined(this.labelFactory)) {
      this.label = this.labelFactory(this.asset);
      return;
    }

    let
      label,
      displayField = this.displayField;

    if (!(displayField in this.asset)) {
      console.error('Incorrect field ' + displayField + ' supplied. Using "label".');
      displayField = 'label';
    }

    label = this.asset[displayField];
    switch (this.displayField) {
      case 'label':
        this.label = (label === 'crafter-level-descriptor.level.xml')
          ? 'Section Defaults'
          : this.asset.label;
        break;
      default:
        this.label = label;
    }

  }

  private selectedItemsStateChanged(selectedItems) {
    let checked = Object.keys(selectedItems);
    this.selected = checked.includes(this.asset.id);
  }

  labelClicked() {

  }
}
