import {
  Component, ComponentFactory, Input, OnInit, Output, EventEmitter, Inject, HostBinding,
  OnChanges
} from '@angular/core';
import { Asset } from '../../../models/asset.model';
import { Observable } from 'rxjs/Observable';
import { WorkflowService } from '../../../services/workflow.service';
import { Site } from '../../../models/site.model';
import { Router } from '@angular/router';
import { WindowMessageScopeEnum } from '../../../enums/window-message-scope.enum';
import { CommunicationService } from '../../../services/communication.service';
import { EmbeddedViewDialogComponent } from '../../embedded-view-dialog/embedded-view-dialog.component';
import { openDialog } from '../../../utils/material.utils';
import { MatDialog } from '@angular/material';
import { AppState } from '../../../classes/app-state.interface';
import { ExpandedPanelsActions } from '../../../actions/expanded-panels.actions';
import { WindowMessageTopicEnum } from '../../../enums/window-message-topic.enum';
import { WithNgRedux } from '../../../classes/with-ng-redux.class';
import { dispatch, NgRedux } from '@angular-redux/store';
import { SelectedItemsActions } from '../../../actions/selected-items.actions';
import { SiteActions } from '../../../actions/site.actions';

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
export class ItemListDashletComponent extends WithNgRedux implements OnInit, OnChanges {
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

  cachedItemIds: string[] = []; // cache of all the asset ids this dashlet is handling
  cachedPanelKeys: string[] = []; // cache of all panel ids this dashlet is handling
  contentItems: Asset[] = []; // the list of items TODO: get form state asset store

  expandedStateRef = {};
  selectedItemsRef = {};

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

  private cachePreInitialized = false;

  constructor(store: NgRedux<AppState>,
              private router: Router,
              public dialog: MatDialog,
              private communicationService: CommunicationService,
              private workflowService: WorkflowService,
              private siteActions: SiteActions) {
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

    this.store.select(['workspaceRef', 'expandedPanels'])
      .pipe(...this.noNullsAndUnSubOps)
      .subscribe(expandedPanels => this.updateLocalExpandedState(expandedPanels));

    this.store.select(['workspaceRef', 'selectedItemsRef'])
      .pipe(...this.noNullsAndUnSubOps)
      .subscribe(selectedItemsRef => this.updateLocalCheckedState(selectedItemsRef));

  }

  ngOnChanges() {
    // this.updateLocalStates();
  }

  menuOptionClicked(action, value?) {
    // each filter sets the property on the this.query attr.
    // refresh uses the query to fetch.
    this.refresh();
  }

  refresh() {
    this.collection = null;
    this.fetch()
      .subscribe(items => {
        this.collection = Observable.of(items);
        this.afterItemsFetched(items);
      });
  }

  requestPreview(item) {
    this.router.navigate([`/preview`])
      .then((value) => {
        setTimeout(() => this.communicationService.publish(
          WindowMessageTopicEnum.NAV_REQUEST, item, WindowMessageScopeEnum.Local));
      });
  }

  allExpanded() {

    const state = this.expandedStateRef;
    const panelKeys = this.cachedPanelKeys;

    // If the loop breaks, it means one item wasn't found in the state,
    // meaning a panel is not expanded and hence not all are expanded.
    let didNotFindOne = panelKeys.some(key => !state[key]);

    return !didNotFindOne;

  }

  allCollapsed() {

    const state = this.expandedStateRef;
    const panelKeys = this.cachedPanelKeys;

    // If the loop breaks, it means the item was found in the state
    // meaning at least that panel is expanded and not all are collapsed.
    let foundOneKey = panelKeys.some(key => state[key]);

    return !foundOneKey;
  }

  @dispatch()
  expandAll() {
    return ExpandedPanelsActions.expandMany(this.cachedPanelKeys, this.site.code);
  }

  @dispatch()
  collapseAll() {
    return ExpandedPanelsActions.collapseMany(this.cachedPanelKeys, this.site.code);
  }

  @dispatch()
  expandedStateChange(entry, expanded) {
    let key = this.getPanelKey(entry);
    return expanded
      ? ExpandedPanelsActions.expand(key, this.site.code)
      : ExpandedPanelsActions.collapse(key, this.site.code);
  }

  allChecked() {

    const state = this.selectedItemsRef;
    const stateIDs = Object.keys(state);
    const itemsIDs = this.cachedItemIds;

    let oneNotFound = itemsIDs.some(id => !stateIDs.includes(id));

    return !oneNotFound;

  }

  allUnchecked() {

    const state = this.selectedItemsRef;
    const stateIDs = Object.keys(state);
    const itemsIDs = this.cachedItemIds;

    let oneFound = itemsIDs.some(id => stateIDs.includes(id));

    return !oneFound;

  }

  @dispatch()
  checkAll() {
    return SelectedItemsActions.selectMany(
      this.cachedItemIds,
      this.site.code);
  }

  @dispatch()
  uncheckAll() {
    return SelectedItemsActions.deselectMany(
      this.cachedItemIds,
      this.site.code);
  }

  @dispatch()
  checkedStateChange(item, checked) {
    return checked
      ? SelectedItemsActions.select(item.id, this.site.code)
      : SelectedItemsActions.deselect(item.id, this.site.code);
  }

  shareCache(collection: Observable<Asset[]>,
             contentItems: Asset[],
             cachedPanelKeys: string[],
             cachedItemIds: string[]) {

    this.collection = collection;
    this.contentItems = contentItems;
    this.cachedPanelKeys = cachedPanelKeys;
    this.cachedItemIds = cachedItemIds;

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
            this.cachedPanelKeys,
            this.cachedItemIds);

        }
      }
    });
  }

  done() {
    this.finished.next();
  }

  getPanelKey(item?) {
    return `${this.fetchType}.panel.${item ? item.label.toLowerCase() : ''}`;
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

  private updateLocalExpandedState(expandedPanels) {
    if (this.type === 'categorized') {

      this.expandedStateRef = expandedPanels;

      this.areAllExpanded = this.allExpanded();
      this.areAllCollapsed = this.allCollapsed();

    }
  }

  private updateLocalCheckedState(selectedItemsRef) {

    this.selectedItemsRef = selectedItemsRef;

    this.areAllChecked = this.allChecked();
    this.areAllUnchecked = this.allUnchecked();

  }

  private afterItemsFetched(items) {

    this.cachedItemIds = [];
    this.cachedPanelKeys = [];
    this.contentItems = (this.type === 'categorized')
      ? items.reduce((nextItems, item) => item.hasChildren
        ? nextItems.concat(item.children)
        : nextItems, [])
      : items;

    if (this.type === 'categorized') {
      // Excludes panels that have no children.
      items.forEach(item => (item.hasChildren) &&
        this.cachedPanelKeys.push(this.getPanelKey(item)));
    }

    this.contentItems.forEach(item => {
      this.cachedItemIds.push(item.id);
    });

    this.runUIStateChecks();

  }

  private runUIStateChecks() {
    this.areAllChecked = this.allChecked();
    this.areAllUnchecked = this.allUnchecked();
    this.areAllExpanded = this.allExpanded();
    this.areAllCollapsed = this.allCollapsed();
  }

}
