import {
  Component, EventEmitter,
  HostBinding,
  Inject,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  Output
} from '@angular/core';
import { Router } from '@angular/router';
import { ComponentWithState } from '../../classes/component-with-state.class';
import { AppStore } from '../../state.provider';
import { AppState } from '../../classes/app-state.interface';
import { SubjectStore } from '../../classes/subject-store.class';
import { Asset } from '../../models/asset.model';
import { ArrayUtils, StringUtils } from '../../app.utils';
import { AssetTypeEnum } from '../../enums/asset-type.enum';
import { CommunicationService } from '../../services/communication.service';
import { AssetActionEnum, AssetMenuOption, WorkflowService } from '../../services/workflow.service';
import { SelectedItemsActions } from '../../actions/selected-items.actions';
import { PreviewTabsActions } from '../../actions/preview-tabs.actions';
import { PreviewTab } from '../../classes/preview-tab.class';

@Component({
  selector: 'std-asset-display',
  templateUrl: './asset-display.component.html',
  styleUrls: ['./asset-display.component.scss']
})
export class AssetDisplayComponent extends ComponentWithState implements OnInit, OnChanges, OnDestroy {

  constructor(@Inject(AppStore) protected store: SubjectStore<AppState>,
              private workflowService: WorkflowService,
              private communicationService: CommunicationService,
              private router: Router) {
    // Init Store
    super(store);
  }

  @Input() asset: Asset;
  @Input() disallowWrap = true;
  @Input() showCheck = false;
  @Input() showIcons = true;
  @Input() showTypeIcon = true;
  @Input() showStatusIcons = true;
  @Input() showMenu: boolean | 'hover' | 'true' | 'false' = 'hover';
  @Input() showLabel = true;
  @Input() showLink = true; // Asset renders as a link when 'previewable'
  @Input() displayField: keyof Asset = 'label';
  @Input() actionHandler: (actionDef: any, $actionNext: () => void) => boolean;

  @Output() action = new EventEmitter();

  // https://stackoverflow.com/questions/45313939/data-binding-causes-expressionchangedafterithasbeencheckederror
  // https://stackoverflow.com/questions/46065535/expressionchangedafterithasbeencheckederror-in-two-way-angular-binding
  // https://angular.io/guide/template-syntax
  // @Output() showIconsChange = new EventEmitter();

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

  menu: Array<AssetMenuOption> = []; // Options of the asset menu drop down
  navigable = true; // Internal control of whether the asset displays as a link or a label
  selected = false;

  // Keeps track of the value of showCheck to determine
  // whether to update stuff related to state.selectedItems
  private priorShowCheckValue;

  ngOnInit() {

  }

  ngOnChanges() {

    this.navigable = this.isNavigable();
    this.menu = this.workflowService
      .getAvailableAssetOptions(this.state.user, this.asset);

    if (this.showMenu === 'true') {
      this.showMenu = true;
    } else if (this.showMenu === 'false') {
      this.showMenu = false;
    }

    // if (!this.showTypeIcon && !this.showStatusIcons) {
    //   this.showIcons = false;
    //   this.showIconsChange.emit(false);
    // }

    if (this.priorShowCheckValue !== this.showCheck) {
      // Only good as far as single subscription...
      if (this.priorShowCheckValue === true) {
        this.unSubscriber.next();
      }
      if (this.showCheck) {
        this.selectedItemsStateChanged();
        this.subscribeTo('selectedItems');
      }
      this.priorShowCheckValue = this.showCheck;
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

  navigate() {
    let
      asset = this.asset,
      tab = new PreviewTab();
    tab.url = asset.url;
    tab.siteCode = asset.siteCode;
    tab.title = asset.label;
    tab.asset = asset;
    this.dispatch(PreviewTabsActions.nav(tab));
    if (!this.router.url.includes('/preview')) {
      this.router.navigate([`/preview`]);
    }
  }

  checkedStateChange(checked) {
    if (checked) {
      this.store.dispatch(SelectedItemsActions.select(this.asset));
    } else {
      this.store.dispatch(SelectedItemsActions.deselect(this.asset));
    }
  }

  menuItemSelected(action) {
    let handleAction = true;
    let eventData = { asset: this.asset, action: action };
    if (this.actionHandler) {
      handleAction = !this.actionHandler(eventData,
        () => this.action.next(eventData));
    }
    if (handleAction) {
      this.handleAction(action);
      this.action.next(eventData);
    }
  }

  handleAction(action) {
    switch (action) {
      case AssetActionEnum.EDIT: {
        let asset = this.asset;
        this.dispatch(PreviewTabsActions.edit({
          url: asset.url,
          siteCode: asset.siteCode,
          asset
        }));
        break;
      }
      default:

        break;
    }
  }

  menuButtonClicked($event: Event) {
    $event.stopPropagation();
  }

  private selectedItemsStateChanged() {
    let checked: Asset[] = this.state.selectedItems;
    this.selected = ArrayUtils.forEachBreak(checked,
      (asset) => asset.id === this.asset.id);
  }

}
