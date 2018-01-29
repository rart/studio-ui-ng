import {
  Component, ComponentFactory, Input, OnInit, Output, EventEmitter, Inject, HostBinding,
  OnChanges
} from '@angular/core';
import { Asset } from '../../../models/asset.model';
import { Observable } from 'rxjs/Observable';
import { WorkflowService } from '../../../services/workflow.service';
import { Project } from '../../../models/project.model';
import { Router } from '@angular/router';
import { CommunicationService } from '../../../services/communication.service';
import { EmbeddedViewDialogComponent } from '../../embedded-view-dialog/embedded-view-dialog.component';
import { openDialog } from '../../../utils/material.utils';
import { MatDialog } from '@angular/material';
import { AppState, LookupTable } from '../../../classes/app-state.interface';
import { ExpandedPanelsActions } from '../../../actions/expanded-panels.actions';
import { WithNgRedux } from '../../../classes/with-ng-redux.class';
import { dispatch, NgRedux, select } from '@angular-redux/store';
import { SelectedItemsActions } from '../../../actions/selected-items.actions';
import { ProjectActions } from '../../../actions/project.actions';
import { PreviewTabsActions } from '../../../actions/preview-tabs.actions';
import { createPreviewTabCore } from '../../../utils/state.utils';
import { AssetActions } from '../../../actions/asset.actions';

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
  @Input() project: Project;
  @Input() settings;
  @Input() uiFormat: Format = 'modern';
  @Input() canExpand = true;

  panelHeaderHeight = '2.5rem';
  type: ItemResponseFormat = 'categorized';

  collection: Observable<any[]>;

  cachedItemIds: string[] = []; // cache of all the asset ids this dashlet is handling
  cachedPanelKeys: string[] = []; // cache of all panel ids this dashlet is handling
  assets: LookupTable<Asset>; // the list of items TODO: get form state asset store

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
    includeLive: true,
    projectCode: null,
    status: null
  };

  itemsFetching = true;

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

  deliveryTableSpace$;

  @select(['entities', 'assets', 'byId'])
  assets$: Observable<LookupTable<Asset>>;

  private cachePreInitialized = false;

  constructor(store: NgRedux<AppState>,
              private router: Router,
              public dialog: MatDialog,
              private communicationService: CommunicationService,
              private workflowService: WorkflowService,
              private projectActions: ProjectActions,
              private assetActions: AssetActions,
              private previewTabsActions: PreviewTabsActions) {
    super(store);
  }

  ngOnInit() {

    this.query.username = this.state.user.username;
    this.query.projectCode = this.project.code;
    this.query.status = this.fetchType;

    if (this.fetchType === 'activity') {
      this.type = 'simple';
    }

    this.pipeFilterAndTakeUntil(this.assets$)
      .subscribe(assets => {
        this.assets = assets;
      });

    // https://stackoverflow.com/questions/40530108/fetch-data-once-with-observables-in-angular-2
    if (!this.collection) {
      this.refresh();
    } else {
      this.itemsFetching = false;
    }

    (!this.isDialog) && (this.finished = null);

    this.pipeFilterAndTakeUntil(
      this.store.select(['workspaceRef', 'expandedPanels']))
      .subscribe(expandedPanels => this.updateLocalExpandedState(expandedPanels));

    this.pipeFilterAndTakeUntil(
      this.store.select(['workspaceRef', 'selectedItems']))
      .subscribe(selectedItems => this.updateLocalCheckedState(selectedItems));

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
    this.itemsFetching = true;
    this.collection = null;
    this.fetch()
      .subscribe(data => {
        let values;
        let assets = data.assets;
        if (this.type === this.TYPE_CATEGORIZED) {
          values = data.groups;
        } else {
          values = assets.map(asset => asset.id);
        }
        this.dispatch(this.assetActions.fetchedSome(assets));
        this.collection = Observable.of(values);
        this.afterItemsFetched(values);
        this.itemsFetching = false;
      });
  }

  @dispatch()
  requestPreview(item) {
    return this.previewTabsActions.nav(
      createPreviewTabCore({
        url: item.url,
        assetId: item.id,
        title: item.label,
        projectCode: item.projectCode
      }));
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
    return ExpandedPanelsActions.expandMany(this.cachedPanelKeys, this.project.code);
  }

  @dispatch()
  collapseAll() {
    return ExpandedPanelsActions.collapseMany(this.cachedPanelKeys, this.project.code);
  }

  @dispatch()
  expandedStateChange(group, expanded) {
    let key = this.getPanelKey(group);
    return expanded
      ? ExpandedPanelsActions.expand(key, this.project.code)
      : ExpandedPanelsActions.collapse(key, this.project.code);
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
      this.project.code);
  }

  @dispatch()
  uncheckAll() {
    return SelectedItemsActions.deselectMany(
      this.cachedItemIds,
      this.project.code);
  }

  @dispatch()
  checkedStateChange(item, checked) {
    return checked
      ? SelectedItemsActions.select(item.id, this.project.code)
      : SelectedItemsActions.deselect(item.id, this.project.code);
  }

  shareCache(collection: Observable<Asset[]>,
             cachedPanelKeys: string[],
             cachedItemIds: string[]) {

    this.collection = collection;
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
          instance.project = this.project;
          instance.title = this.title;
          instance.uiFormat = 'table';
          instance.fetchType = this.fetchType;

          instance.shareCache(
            this.collection,
            this.cachedPanelKeys,
            this.cachedItemIds);

        }
      }
    });
  }

  done() {
    this.finished.next();
  }

  getPanelKey(group) {
    let key = typeof group !== 'string'
      ? (<any>group).label.toLowerCase()
      : group;
    return `${this.fetchType}.panel.${key}`;
  }

  private fetch() {
    return this.workflowService.fetch(this.query);
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

  // values is
  // - { label, ids }[] when type === categorized
  // - ids[] when type !== categorized
  private afterItemsFetched(values) {

    this.cachedItemIds = [];
    this.cachedPanelKeys = [];

    if (this.type === 'categorized') {

      // Excludes panels that have no children so they don't affect
      // the calculations of whether they are all/none checked
      values.forEach(group => (group.ids.length > 0) &&
        this.cachedPanelKeys.push(this.getPanelKey(group)));

      this.cachedItemIds = values.reduce((allIds, group) => allIds.concat(group.ids), []);

    } else {
      this.cachedItemIds.push(values);
    }

    this.runUIStateChecks();

  }

  private runUIStateChecks() {
    this.areAllChecked = this.allChecked();
    this.areAllUnchecked = this.allUnchecked();
    this.areAllExpanded = this.allExpanded();
    this.areAllCollapsed = this.allCollapsed();
  }

}
