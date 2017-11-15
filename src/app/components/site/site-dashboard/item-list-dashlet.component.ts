import {Component, Input, OnChanges, OnInit, Output} from '@angular/core';
import {ContentItem} from '../../../models/content-item.model';
import {Observable} from 'rxjs/Observable';

const MONO_LEVEL = 'MONO_LEVEL';
const CATEGORIZED = 'CATEGORIZED';

@Component({
  selector: 'std-item-list-dashlet',
  templateUrl: './item-list-dashlet.component.html',
  styleUrls: ['./item-list-dashlet.component.scss']
})
export class ItemListDashletComponent implements OnInit {

  @Input() title: string;
  @Input() collection: Observable<ContentItem>;
  @Input() type = CATEGORIZED;

  @Input() settings;
  @Output() settingsChanged;

  panelHeaderHeight = '2.5rem';

  expandedState = {};
  checkedState = {};

  CATEGORIZED = CATEGORIZED;

  constructor() { }

  ngOnInit() {
    this.collection
      .subscribe((items) => this.initializeState(items));
  }

  initializeState(items) {
    let state;

    if (this.type === CATEGORIZED) {

      state = this.expandedState;
      items.forEach(item => state[item.label] = true);

      state = this.checkedState;
      items.forEach(item => (item.children || [])
        .forEach(child => state[child.internalURL] = true));

    } else {
      state = this.checkedState;
      items.forEach((item) => state[item.internalURL] = true);
    }

  }

  allExpanded() {

    let allExpanded = true;
    const expandedState = this.expandedState;

    Object.keys(expandedState).forEach((key) => {
      if (!expandedState[key]) {
        allExpanded = false;
      }
    });

    return allExpanded;
  }

  allCollapsed() {

    let allCollapsed = true;
    const expandedState = this.expandedState;

    Object.keys(expandedState).forEach((key) => {
      if (expandedState[key]) {
        allCollapsed = false;
      }
    });

    return allCollapsed;
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
    const expandedState = this.expandedState;
    Object.keys(expandedState).forEach((key) => {
      expandedState[key] = true;
    });
  }

  collapseAll() {
    const expandedState = this.expandedState;
    Object.keys(expandedState).forEach((key) => {
      expandedState[key] = false;
    });
  }

  checkAll() {
    const state = this.checkedState;
    Object.keys(state).forEach((key) => {
      state[key] = true;
    });
  }

  uncheckAll() {
    const state = this.checkedState;
    Object.keys(state).forEach((key) => {
      state[key] = false;
    });
  }

}
