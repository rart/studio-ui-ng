import {Component, ComponentFactory, Input, OnInit, Output, EventEmitter, Inject} from '@angular/core';
import {ContentItem} from '../../../models/content-item.model';
import {Observable} from 'rxjs/Observable';
import {WorkflowService} from '../../../services/workflow.service';
import {Site} from '../../../models/site.model';
import {Router} from '@angular/router';
import {MessageScope, MessageTopic} from '../../../classes/communicator.class';
import {CommunicationService} from '../../../services/communication.service';
import {EmbeddedViewDialogComponent} from '../../embedded-view-dialog/embedded-view-dialog.component';
import {ArrayUtils, openDialog} from '../../../app.utils';
import {MatDialog} from '@angular/material';
import {AppStore} from '../../../app-state.provider';
import {AppState} from '../../../classes/app-state.interface';
import {Store} from 'redux';
import {Actions as ExpansionAction} from '../../../../state/expanded-panels.state';

type Format = 'modern' | 'table';
type ItemResponseFormat = 'categorized' | 'simple';

const DIVIDER = 'DIVIDER';

enum ItemAction {
  PREVIEW,
  SCHEDULE,
  APPROVE_PUBLISH,
  EDIT,
  DELETE,
  HISTORY,
  DEPENDENCIES,
  FORM_VIEW
}

export declare type FetchType = 'pending' | 'scheduled' | 'activity' | 'published';

@Component({
  selector: 'std-item-list-dashlet',
  templateUrl: './item-list-dashlet.component.html',
  styleUrls: ['./item-list-dashlet.component.scss']
})
export class ItemListDashletComponent implements OnInit {

  // PANEL_KEY_PREFIX = this.getPanelKey();
  UI_FORMAT_MODERN: Format = 'modern';
  UI_FORMAT_TABLE: Format = 'table';
  TYPE_CATEGORIZED: ItemResponseFormat = 'categorized';
  TYPE_SIMPLE: ItemResponseFormat = 'simple';

  isDialog = false;
  @Output() finished = new EventEmitter();

  @Input() title: string;
  @Input() collection: Observable<ContentItem>;
  @Input() fetchType: FetchType;
  @Input() site: Site;
  @Input() settings;
  @Input() uiFormat: Format = 'modern';

  @Output() settingsChanged;

  type: ItemResponseFormat = 'categorized';
  panelHeaderHeight = '2.5rem';

  cachedPanelKeys: Array<string> = [];
  expandedState = {};

  itemsFromCollection: Array<ContentItem>;
  checkedState = {};

  areAllChecked = false;
  areAllUnchecked = true;
  areAllExpanded = false;
  areAllCollapsed = false;

  itemMenuMap = {};

  constructor(@Inject(AppStore) private store: Store<AppState>,
              private router: Router,
              public dialog: MatDialog,
              private communicationService: CommunicationService,
              private workflowService: WorkflowService) {
  }

  ngOnInit() {

    if (this.fetchType === 'activity') {
      this.type = 'simple';
    }

    /* tslint:disable:no-unused-expression */
    (!this.collection) && this.fetch()
      .subscribe(items => {
        this.afterItemsFetched(items);
      });

    (!this.isDialog) && (this.finished = null);

    this.updateLocalStates();

    this.store.subscribe(() => {
      this.updateLocalStates();
    });

  }

  fetch(): Observable<ContentItem[]> {
    let fn = null;
    const service = this.workflowService;
    switch (this.fetchType) {
      case 'pending': {
        fn = 'fetchPendingApproval';
        break;
      }
      case 'scheduled': {
        fn = 'fetchScheduled';
        break;
      }
      case 'activity': {
        fn = 'fetchUserActivities';
        break;
      }
      case 'published': {
        fn = 'fetchDeploymentHistory';
        break;
      }
      default: {
        // throw new Error('Unrecognized FetchType specified for ItemListDashletComponent');
        console.log('Unrecognized FetchType specified for ItemListDashletComponent');
      }
    }
    return this.collection =
      service[fn]({siteCode: this.site.code})
        .map((data) => data.entries);
  }

  menuActionClicked(action, item) {
    switch (action) {
      case ItemAction.PREVIEW: {
        this.requestPreview(item);
        break;
      }
      default:
        break;
    }
  }

  requestPreview(item) {
    this.router.navigate([`/preview`])
      .then((value) => {
        setTimeout(() => this.communicationService.publish(
          MessageTopic.SITE_TREE_NAV_REQUEST, item, MessageScope.Local));
      });
  }

  cacheItemMenus(items) {
    let
      itemMenuMap = this.itemMenuMap,
      getMenuItemsFor = this.getItemMenu;
    items.forEach(item =>
      itemMenuMap[item.id] = getMenuItemsFor(item));
  }

  allExpanded() {

    const state = this.store.getState().expandedPanels;
    const panelKeys = this.cachedPanelKeys; // Object.keys(this.expandedState);

    // If the loop breaks, it means one item wasn't found in the state,
    // meaning a panel is not expanded and hence not all are expanded.
    let didNotFindOneKey = ArrayUtils.forEachBreak(panelKeys, (key) => {
      return !ArrayUtils.contains(state, key);
    });

    return !didNotFindOneKey;

  }

  allCollapsed() {

    const state = this.store.getState().expandedPanels;
    const panelKeys = this.cachedPanelKeys; // Object.keys(this.expandedState);

    // If the loop breaks, it means the item was found in the state
    // meaning at least that panel is expanded and not all are collapsed.
    let foundOneKey = ArrayUtils.forEachBreak(panelKeys, (key) => {
      return ArrayUtils.contains(state, key);
    });

    return !foundOneKey;
  }

  allChecked() {
    let allChecked = true;
    const state = this.checkedState;
    Object.keys(state).forEach((key) => {
      if (!state[key]) {
        allChecked = false;
      }
    });
    return allChecked;
  }

  allUnchecked() {
    let allUnChecked = true;
    const state = this.checkedState;
    Object.keys(state).forEach((key) => {
      if (state[key]) {
        allUnChecked = false;
      }
    });
    return allUnChecked;
  }

  expandAll() {
    this.store.dispatch(
      ExpansionAction.expandMany(this.cachedPanelKeys));
    // const expandedState = this.expandedState;
    // Object.keys(expandedState).forEach((key) => {
    //   expandedState[key] = true;
    // });
    // this.areAllExpanded = true;
    // this.areAllCollapsed = false;
  }

  collapseAll() {
    this.store.dispatch(
      ExpansionAction.collapseMany(this.cachedPanelKeys));
    // const expandedState = this.expandedState;
    // Object.keys(expandedState).forEach((key) => {
    //   expandedState[key] = false;
    // });
    // this.areAllExpanded = false;
    // this.areAllCollapsed = true;
  }

  checkAll() {
    const state = this.checkedState;
    Object.keys(state).forEach((key) => {
      state[key] = true;
    });
    this.areAllChecked = true;
    this.areAllUnchecked = false;
  }

  uncheckAll() {
    const state = this.checkedState;
    Object.keys(state).forEach((key) => {
      state[key] = false;
    });
    this.areAllChecked = false;
    this.areAllUnchecked = true;
  }

  expandedStateChange(entry, expanded) {

    let key = this.getPanelKey(entry);
    if (expanded) {
      this.store.dispatch(ExpansionAction.expand(key));
    } else {
      this.store.dispatch(ExpansionAction.collapse(key));
    }

    // this.expandedState[entry.label] = expanded;
    // if (expanded) {
    //   this.areAllExpanded = this.allExpanded();
    //   this.areAllCollapsed = false;
    // } else {
    //   this.areAllExpanded = false;
    //   this.areAllCollapsed = this.allCollapsed();
    // }

  }

  checkedStateChange(entry, checked) {
    this.checkedState[entry.label] = checked;
    if (checked) {
      this.areAllChecked = this.allChecked();
      this.areAllUnchecked = false;
    } else {
      this.areAllChecked = false;
      this.areAllUnchecked = this.allUnchecked();
    }
  }

  popOut() {
    let dialogRef, subscription;
    dialogRef = openDialog(this.dialog, EmbeddedViewDialogComponent, {
      width: '90%',
      height: '90%',
      panelClass: 'unpadded',
      data: {
        component: ItemListDashletComponent,
        initializeComponent: (componentRef: ComponentFactory<ItemListDashletComponent>) => {
          let instance = <ItemListDashletComponent>(componentRef['instance']);
          instance.isDialog = true;
          instance.site = this.site;
          instance.uiFormat = 'table';
          instance.title = this.title;
          instance.fetchType = this.fetchType;
          instance.collection = this.collection;
          instance.itemMenuMap = this.itemMenuMap;
          // Should be unnecessary once redux is properly plugged
          instance.expandedState = this.expandedState;
          instance.checkedState = this.checkedState;
          instance.areAllChecked = this.areAllChecked;
          instance.areAllUnchecked = this.areAllUnchecked;
          instance.areAllExpanded = this.areAllExpanded;
          instance.areAllCollapsed = this.areAllCollapsed;
        }
      }
    });
    subscription = dialogRef.afterClosed()
      .subscribe(() => {

      });
  }

  done() {
    this.finished.next();
  }

  getPanelKey(item?) {
    return `${this.fetchType}.panel.${item ? item.label : ''}`;
  }

  private updateLocalStates() {
    this.updateLocalCheckedState();
    this.updateLocalExpandedState();
  }

  private updateLocalExpandedState() {
    if (this.type === 'categorized') {

      let
        state = this.store.getState(),
        expandedPanels = state.expandedPanels,
        expandedState = this.expandedState = {};

      expandedPanels.forEach(key => {
        expandedState[key] = true;
      });

      this.areAllExpanded = this.allExpanded();
      this.areAllCollapsed = this.allCollapsed();

    }
  }

  private updateLocalCheckedState() {

    let
      state = this.store.getState(),
      selectedItems = state.selectedItems,
      checkedState = this.checkedState = {};

    selectedItems.forEach((item) => {
      checkedState[item.internalURL] = true;
    });

    this.areAllChecked = this.allChecked();
    this.areAllUnchecked = this.allUnchecked();

  }

  private afterItemsFetched(items) {
    this.itemsFromCollection = items;
    this.itemMenuMap = {};
    this.cachedPanelKeys = [];
    items.forEach(item => {
      this.itemMenuMap[item.id] = this.getItemMenu(item);
      this.cachedPanelKeys.push(this.getPanelKey(item));
    });
    this.runUIStateChecks();
  }

  // Currently called statically
  private getItemMenu(item) {
    return [
      {label: 'Preview', action: ItemAction.PREVIEW},
      DIVIDER,
      {label: 'Schedule', action: ''},
      {label: 'Approve & Publish', action: ''},
      DIVIDER,
      {label: 'Edit', action: ''},
      {label: 'Delete', action: ''},
      {label: 'History', action: ''},
      {label: 'Dependencies', action: ''},
      DIVIDER,
      {label: 'Form (readonly)', action: ''}
    ];
  }

  private runUIStateChecks() {
    this.areAllChecked = this.allChecked();
    this.areAllUnchecked = this.allUnchecked();
    this.areAllExpanded = this.allExpanded();
    this.areAllCollapsed = this.allCollapsed();
  }

}
