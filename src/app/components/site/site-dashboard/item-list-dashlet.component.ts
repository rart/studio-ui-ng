import { Component, ComponentFactory, Input, OnInit, Output, EventEmitter, Inject, HostBinding } from '@angular/core';
import { Asset } from '../../../models/asset.model';
import { Observable } from 'rxjs/Observable';
import { WorkflowService } from '../../../services/workflow.service';
import { Site } from '../../../models/site.model';
import { Router } from '@angular/router';
import { WindowMessageScopeEnum} from '../../../enums/window-message-scope.enum';
import { CommunicationService } from '../../../services/communication.service';
import { EmbeddedViewDialogComponent } from '../../embedded-view-dialog/embedded-view-dialog.component';
import { ArrayUtils, openDialog } from '../../../app.utils';
import { MatDialog } from '@angular/material';
import { AppStore } from '../../../state.provider';
import { AppState } from '../../../classes/app-state.interface';
import { SubjectStore } from '../../../classes/subject-store.class';
import { Actions as ExpansionAction } from '../../../../state/expanded-panels.state';
import { Actions as SelectionAction } from '../../../../state/selected-items.state';
import { Subscriber } from 'rxjs/Subscriber';
import { MatMenu } from '@angular/material/menu/typings/menu-directive';
import { ViewChild } from '@angular/core/src/metadata/di';
import { MatMenuItem } from '@angular/material/menu/typings/menu-item';
import { WindowMessageTopicEnum } from '../../../enums/window-message-topic.enum';
import { ComponentWithState } from '../../../classes/component-with-state.class';

type Format = 'modern' | 'table';
type ItemResponseFormat = 'categorized' | 'simple';
type TYPE_DIVIDER = 'DIVIDER';

const DIVIDER: TYPE_DIVIDER = 'DIVIDER';

const optionsMenuCommon = [
  {
    type: 'menu',
    label: 'Sort By',
    action: 'sortBy',
    options: [
      { label: 'Name', value: 'name' },
      { label: 'URL', value: 'url' },
      { label: 'Edited By', value: 'lastEditedBy' },
      { label: 'Edited On', value: 'lastEditedOn' }
    ]
  },
  {
    type: 'menu',
    label: 'Sort Direction',
    action: 'sortDirection',
    options: [
      { label: 'Ascending', value: 'ASC' },
      { label: 'Descending', value: 'DESC' }
    ]
  }
];

const typeOfItemFilterMenuOption = {
  type: 'menu',
  label: 'Types Shown',
  action: 'filterType',
  options: [
    { label: 'All', value: 'all' },
    { label: 'Pages', value: 'page' },
    { label: 'Components', value: 'component' },
    { label: 'Documents', value: 'document' }
  ]
};

const numOfItemsMenuOption = {

  // Not supporting inputs right now since matMenu closes on first click
  // type: 'input',

  type: 'menu',
  label: 'Items Shown',
  action: 'num',
  options: [
    { value: 20 },
    { value: 50 },
    { value: 100 },
    { value: 200 }
  ]
};

enum ItemActionEnum {
  PREVIEW,
  SCHEDULE,
  APPROVE_PUBLISH,
  EDIT,
  DELETE,
  HISTORY,
  DEPENDENCIES,
  FORM_VIEW
}

export enum DashletActionEnum {
  SORT_BY,
  CUSTOM
}

export interface MenuItem {
  label: string;
  action?: ItemActionEnum | DashletActionEnum;
  options?: MenuItem[];
}

export interface MenuItemDivier extends MenuItem {
  type: TYPE_DIVIDER;
}

export declare type FetchType =
  'pending' |
  'scheduled' |
  'activity' |
  'published';

@Component({
  selector: 'std-item-list-dashlet',
  templateUrl: './item-list-dashlet.component.html',
  styleUrls: ['./item-list-dashlet.component.scss']
})
export class ItemListDashletComponent extends ComponentWithState implements OnInit {
  /* tslint:disable:no-unused-expression */

  UI_FORMAT_MODERN: Format = 'modern';
  UI_FORMAT_TABLE: Format = 'table';
  TYPE_CATEGORIZED: ItemResponseFormat = 'categorized';
  TYPE_SIMPLE: ItemResponseFormat = 'simple';

  @HostBinding('class.is-dialog') isDialog = false;

  @Output() finished = new EventEmitter();
  @Output() settingsChanged;

  @Input() title: string;
  @Input() fetchType: FetchType;
  @Input() site: Site;
  @Input() settings;
  @Input() uiFormat: Format = 'modern';
  @Input() canExpand = true;

  panelHeaderHeight = '2.5rem';
  type: ItemResponseFormat = 'categorized';

  collection: Observable<Asset[]>;

  cachedPanelKeys: Array<string> = [];
  expandedState = {};

  contentItems: Array<Asset> = [];
  checkedState = {};

  areAllChecked = false;
  areAllUnchecked = true;
  areAllExpanded = false;
  areAllCollapsed = false;

  query = {
    num: 20,
    sortDirection: 'ASC',
    sortBy: 'lastEditedOn',
    includeInProgress: true,
    filterType: 'all',
    username: null,
    includeLive: true
  };
  dashletMenuMap = {
    'pending': [
      ...optionsMenuCommon,
      {
        type: 'menu',
        label: 'Show In Progress',
        action: 'includeInProgress',
        options: [
          { label: 'Yes', value: true },
          { label: 'No', value: false }
        ]
      }
    ],
    'scheduled': [
      ...optionsMenuCommon,
      typeOfItemFilterMenuOption
    ],
    'published': [
      ...optionsMenuCommon,
      typeOfItemFilterMenuOption,
      numOfItemsMenuOption
    ],
    'activity': [
      ...optionsMenuCommon,
      numOfItemsMenuOption
    ]
  };
  itemMenuMap = {};

  private cachePreInitialized = false;

  constructor(@Inject(AppStore) protected store: SubjectStore<AppState>,
              private router: Router,
              public dialog: MatDialog,
              private communicationService: CommunicationService,
              private workflowService: WorkflowService) {
    super(store);
  }

  ngOnInit() {

    this.query.username = this.state.user.username;

    if (this.fetchType === 'activity') {
      this.type = 'simple';
    }

    // https://stackoverflow.com/questions/40530108/fetch-data-once-with-observables-in-angular-2
    if (!this.collection) {
      this.refresh();
    }

    (!this.isDialog) && (this.finished = null);

    this.updateLocalStates();

    this.subscribeTo({
      'selectedItems': () => this.updateLocalCheckedState(),
      'expandedPanels': () => this.updateLocalExpandedState()
    });

  }

  menuOptionClicked(action, value?) {
    this.refresh();
    // switch (action) {
    //   case 'sortBy':
    //   case 'sortDirection':
    //   case 'includeInProgress':
    //     this.collection = this.fetch();
    //     break;
    // }
  }

  refresh() {
    this.collection = null;
    this.fetch()
      .subscribe(items => {
        this.collection = Observable.of(items);
        this.afterItemsFetched(items);
      });
  }

  menuActionClicked(action, item) {
    switch (action) {
      case ItemActionEnum.PREVIEW: {
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
          WindowMessageTopicEnum.NAV_REQUEST, item, WindowMessageScopeEnum.Local));
      });
  }

  allExpanded() {

    const state = this.state.expandedPanels;
    const panelKeys = this.cachedPanelKeys;

    let countSome = 0;
    let countForBreak = 0;

    // If the loop breaks, it means one item wasn't found in the state,
    // meaning a panel is not expanded and hence not all are expanded.
    let didNotFindOne = panelKeys.some(key => !state.includes(key));

    return !didNotFindOne;

  }

  allCollapsed() {

    const state = this.state.expandedPanels;
    const panelKeys = this.cachedPanelKeys; // Object.keys(this.expandedState);

    // If the loop breaks, it means the item was found in the state
    // meaning at least that panel is expanded and not all are collapsed.
    let foundOneKey = panelKeys.some(key => state.includes(key));

    return !foundOneKey;
  }

  expandAll() {
    this.store.dispatch(
      ExpansionAction.expandMany(this.cachedPanelKeys));
  }

  collapseAll() {
    this.store.dispatch(
      ExpansionAction.collapseMany(this.cachedPanelKeys));
  }

  expandedStateChange(entry, expanded) {

    let key = this.getPanelKey(entry);
    if (expanded) {
      this.store.dispatch(ExpansionAction.expand(key));
    } else {
      this.store.dispatch(ExpansionAction.collapse(key));
    }

  }

  allChecked() {

    const state = this.state.selectedItems;
    const items = this.contentItems;

    const reducer = (ids, item) => ids.concat(item.id);
    const stateIDs = state.reduce(reducer, []);
    const itemsIDs = items.reduce(reducer, []);

    let oneNotFound = itemsIDs.some(id => !stateIDs.includes(id));

    return !oneNotFound;

  }

  allUnchecked() {

    const state = this.state.selectedItems;
    const items = this.contentItems;

    const reducer = (ids, item) => ids.concat(item.id);
    const stateIDs = state.reduce(reducer, []);
    const itemsIDs = items.reduce(reducer, []);

    let oneFound = itemsIDs.some(id => stateIDs.includes(id));

    return !oneFound;

  }

  checkAll() {
    this.store.dispatch(
      SelectionAction.selectMany(this.contentItems));
  }

  uncheckAll() {
    this.store.dispatch(
      SelectionAction.deselectMany(this.contentItems));
  }

  checkedStateChange(item, checked) {
    if (checked) {
      this.store.dispatch(
        SelectionAction.select(item));
    } else {
      this.store.dispatch(
        SelectionAction.deselect(item));
    }
  }

  shareCache(collection: Observable<Asset[]>,
             contentItems: Asset[],
             itemMenuMap: Object,
             cachedPanelKeys: Array<string>) {

    this.collection = collection;
    this.contentItems = contentItems;
    this.itemMenuMap = itemMenuMap;
    this.cachedPanelKeys = cachedPanelKeys;

    this.cachePreInitialized = true;

  }

  popOut() {
    let dialogRef, subscription;
    dialogRef = openDialog(this.dialog, EmbeddedViewDialogComponent, {
      width: '90%',
      height: '90%',
      maxWidth: 'auto',
      maxHeight: 'auto',
      panelClass: 'unpadded',
      data: {
        component: ItemListDashletComponent,
        initializeComponent: (componentRef: ComponentFactory<ItemListDashletComponent>) => {

          // TODO: careful for angular API changes.
          // Property 'instance' seems not to be one that is published by the API willingly.
          let instance = <ItemListDashletComponent>(componentRef['instance']);

          instance.isDialog = true;
          instance.site = this.site;
          instance.title = this.title;
          instance.uiFormat = 'table';
          instance.fetchType = this.fetchType;

          instance.shareCache(
            this.collection,
            this.contentItems,
            this.itemMenuMap,
            this.cachedPanelKeys);

        }
      }
    });
  }

  done() {
    this.finished.next();
  }

  getPanelKey(item?) {
    return `${this.fetchType}.panel.${item ? item.label : ''}`;
  }

  private fetch(): Observable<Asset[]> {
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
        throw new Error('Unrecognized FetchType specified for ItemListDashletComponent');
      }
    }
    return service[fn](Object.assign({ siteCode: this.site.code }, this.query))
      .map((data) => data.entries);
  }

  private cacheItemMenus(items) {
    let
      itemMenuMap = this.itemMenuMap,
      getMenuItemsFor = this.getItemMenu;
    items.forEach(item =>
      itemMenuMap[item.id] = getMenuItemsFor(item));
  }

  private updateLocalStates() {
    this.updateLocalCheckedState();
    this.updateLocalExpandedState();
  }

  private updateLocalExpandedState() {
    if (this.type === 'categorized') {

      let
        state = this.state,
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
      state = this.state,
      siteCode = this.site.code,
      selectedItems = state.selectedItems,
      checkedState = this.checkedState = {};

    selectedItems.forEach((item) => {
      if (item.siteCode === siteCode) {
        checkedState[item.id] = true;
      }
    });

    this.areAllChecked = this.allChecked();
    this.areAllUnchecked = this.allUnchecked();

  }

  private afterItemsFetched(items) {

    this.itemMenuMap = {};
    this.cachedPanelKeys = [];
    this.contentItems = (this.type === 'categorized')
      ? items.reduce((nextItems, item) =>
        item.hasChildren
          ? nextItems.concat(item.children)
          : nextItems, [])
      : items;

    // Excludes panels that have no children.
    items.forEach(item => (item.hasChildren) &&
      this.cachedPanelKeys.push(this.getPanelKey(item)));

    this.contentItems.forEach(item =>
      this.itemMenuMap[item.id] = this.getItemMenu(item));

    this.runUIStateChecks();

  }

  private getItemMenu(item) {
    return [
      { label: 'Preview', action: ItemActionEnum.PREVIEW },
      DIVIDER,
      { label: 'Schedule', action: '' },
      { label: 'Approve & Publish', action: '' },
      DIVIDER,
      { label: 'Edit', action: '' },
      { label: 'Delete', action: '' },
      { label: 'History', action: '' },
      { label: 'Dependencies', action: '' },
      DIVIDER,
      { label: 'Form (readonly)', action: '' }
    ];
  }

  private runUIStateChecks() {
    this.areAllChecked = this.allChecked();
    this.areAllUnchecked = this.allUnchecked();
    this.areAllExpanded = this.allExpanded();
    this.areAllCollapsed = this.allCollapsed();
  }

}
