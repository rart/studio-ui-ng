import {
  ChangeDetectionStrategy, ChangeDetectorRef,
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
import { AppState, LookupTable, StateEntity } from '../../classes/app-state.interface';
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
import { filter, take, takeUntil, withLatestFrom } from 'rxjs/operators';
import { merge } from 'rxjs/observable/merge';
import { isNullOrUndefined } from 'util';
import { ReplaySubject } from 'rxjs/ReplaySubject';
import { Subject } from 'rxjs/Subject';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';

declare type LabelFactory = (asset: Asset) => string;

let count = 0;

@Component({
  selector: 'std-asset-display',
  templateUrl: './asset-display.component.html',
  styleUrls: ['./asset-display.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AssetDisplayComponent extends WithNgRedux implements OnChanges, OnDestroy {

  constructor(store: NgRedux<AppState>,
              private workflowService: WorkflowService,
              private communicationService: CommunicationService,
              private router: Router,
              private assetActions: AssetActions,
              private previewTabsActions: PreviewTabsActions,
              private detector: ChangeDetectorRef) {
    // Init Store
    super(store);
  }

  count = count++; // A counter to produce unique IDs on the template for label[for] to point to the checkbox
  asset: Asset;

  asset$ = new ReplaySubject<Asset>();
  ngOnChanges$ = new Subject();
  loading = false;
  error = false;

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

  @Input() checked = false;
  @Output() checkedChange = new EventEmitter();

  // https://stackoverflow.com/questions/45313939/data-binding-causes-expressionchangedafterithasbeencheckederror
  // https://stackoverflow.com/questions/46065535/expressionchangedafterithasbeencheckederror-in-two-way-angular-binding
  // https://angular.io/guide/template-syntax
  // @Output() showIconsChange = new EventEmitter();

  label;
  typeClass;
  lockClass;
  statusClass;
  lockedByCurrent;
  iconDescription;
  @HostBinding('class.label-left-clear')
  labelLeftClear;
  @HostBinding('class.hover-menu')
  hoverMenu;
  navigable = true; // Internal control of whether the asset displays as a link or a label
  selected = false;
  shouldShowMenu = false; // internal compiled value of the @input showMenu

  ngOnChanges(ngChanges: SimpleChanges) {
    let { ngOnChanges$, ngOnDestroy$, asset$, id, state, detector } = this;
    ngOnChanges$.next(ngChanges);

    this.setMenuVisibility();
    this.setLabelLeftClear();

    if (notNullOrUndefined(id)) {

      this.select<StateEntity<Asset>>(['entities', 'assets'])
        .pipe(takeUntil(merge(ngOnChanges$, ngOnDestroy$)))
        .subscribe((table) => {
          let hasChanged = false;
          if (notNullOrUndefined(table.error[id]) && (table.error[id] !== this.error)) {
            this.error = table.error[id];
            hasChanged = true;
          }
          if (notNullOrUndefined(table.loading[id]) && (table.loading[id] !== this.loading)) {
            this.loading = table.loading[id];
            hasChanged = true;
          }
          if (notNullOrUndefined(table.byId[id]) && (table.byId[id] !== this.asset)) {
            this.asset = table.byId[id];
            this.asset$.next(this.asset);

            this.setIsNavigable();
            this.setIconDescription();
            this.setLockedByCurrent();
            this.setTypeClass();
            this.setStatusClass();
            this.setLabel();

            hasChanged = true;
          }
          if (hasChanged) {
            detector.detectChanges();
          }
        });

      if (isNullOrUndefined(state.entities.assets.byId[id])) {
        this.dispatch(this.assetActions.get(id));
      }

    }

    if (this.showCheck && this.checkMode === 'state') {
      this.select<LookupTable<boolean>>(['workspaceRef', 'selectedItems'])
        .pipe(
          this.filterNulls(),
          withLatestFrom(asset$, x => x),
          takeUntil(merge(ngOnChanges$, ngOnDestroy$))
        )
        .subscribe(selectedItems => this.selectedItemsStateChanged(selectedItems));
    }

  }

  @dispatch()
  navigate($event) {
    let
      { asset, state } = this,
      tab = createPreviewTabCore({
        url: asset.url,
        projectCode: asset.projectCode,
        title: asset.label,
        assetId: asset.id
      });
    if ($event.metaKey) {
      return state.settings[SettingsEnum.CLICK_WITH_META_OPENS_TAB_IN_BACKGROUND]
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
    this.lockClass = `lock ${this.lockedByCurrent ? 'yourself' : ''}`;
  }

  private setTypeClass() {
    let type = this.asset
      .type
      .toLowerCase()
      .replace(/_/g, ' ');
    this.typeClass = `type ${type}`;
  }

  private setStatusClass() {
    let status = this.asset
      .workflowStatus
      .toLowerCase()
      .replace(/_/g, ' ');
    this.statusClass = `status ${status}`;
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

}
