import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Observable } from 'rxjs/Observable';
import { debounceTime, map, scan, shareReplay, combineLatest, startWith, takeUntil } from 'rxjs/operators';
import 'rxjs/add/observable/merge';

import { WorkflowService } from '../../services/workflow.service';
import { ActivatedRoute } from '@angular/router';
import { WorkflowStatusEnum } from '../../enums/workflow-status.enum';
import { MatSnackBar } from '@angular/material';
import { showSnackBar } from '../../app.utils';
import { Subject } from 'rxjs/Subject';


@Component({
  selector: 'std-workflow-states',
  templateUrl: './workflow-states.component.html',
  styleUrls: ['./workflow-states.component.scss']
})
export class WorkflowStatesComponent implements OnInit, OnDestroy {

  site;
  items;
  filterQuery = new FormControl('');
  pagedItems;
  selected = {};
  states = Object.keys(WorkflowStatusEnum)
    .filter((key) => key !== WorkflowStatusEnum.UNKNOWN);

  pageSizeOptions = [5, 10, 25, 50, 100];
  pageSize = this.pageSizeOptions[0];
  totalNumOfAssets = 0;
  numOfPages = 0;
  pageIndex = 0;

  bulkProcessing = false;
  bulkProcessingItems = null;

  count = 1;

  unsubscriptionControl = new Subject();

  constructor(private route: ActivatedRoute,
              private snackBar: MatSnackBar,
              private workflowService: WorkflowService) { }

  ngOnInit() {

    this.route.data
      .subscribe(data => this.site = data.site);

    this.refresh();

  }

  ngOnDestroy() {
    this.unsubscriptionControl.next();
    this.unsubscriptionControl.complete();
  }

  fetch() {
    if (!this.unsubscriptionControl) {
      this.unsubscriptionControl = new Subject();
    }

    this.unsubscriptionControl.next();

    let count = this.count++;

    let items$ = this.workflowService
      .assetStatusReport(this.site.code, 'ALL')
      .pipe(shareReplay(1));

    let query$ = this.filterQuery
      .valueChanges
      .pipe(
        debounceTime(250),
        startWith(this.filterQuery.value)
      );

    this.items = items$.pipe(
      combineLatest(query$,
        (items, query) => items.filter(item => (query.trim() === '') || (item.asset.id.includes(query)))
      ),
      takeUntil(this.unsubscriptionControl)
    );

    return this.items;

  }

  selectAll() {
    Object.keys(this.selected).forEach(key => this.selected[key] = true);
  }

  selectNone() {
    Object.keys(this.selected).forEach(key => this.selected[key] = false);
  }

  itemStatusChanged(i) {
    return this.workflowService
      .setAssetStatus(this.site.code, i.asset.id, i.asset.workflowStatus, i.processing)
      .subscribe(() => {
        showSnackBar(this.snackBar, 'Status set successfully.');
      });
  }

  bulkSetStates(newWorkflowState) {
    let
      selected = this.selected,
      selectedIds = Object.keys(selected).filter(key => selected[key]);
    if (selectedIds.length === 0) {
      showSnackBar(this.snackBar, 'No assets have been selected. No changes performed.');
      return;
    }
    this.items
      .subscribe((items) => {

        this.bulkProcessing = true;

        let
          mapOfItems = {},
          processes = [],
          accumulator = [];

        items = items
          // Based on the selection, get the full item data from the previous fetch
          .filter((item) => selectedIds.includes(item.id));

        items
          .forEach((item) => {
            mapOfItems[item.asset.id] = item;
            // Create the initial report (accumulator) with all 'done' properties set to false
            accumulator.push({ id: item.asset.id, done: false });
            // Gather all the observable requests to services to be able to merge them later
            processes.push(
              this.workflowService.setAssetStatus(
                item.asset.siteCode,
                item.asset.id,
                newWorkflowState,
                item.processing).pipe(shareReplay(1)));
          });

        // An observable to fire immediately and show all as "processing..."
        processes.unshift(Observable.of({ entity: accumulator[0] }));

        this.bulkProcessingItems = Observable.merge
          .apply(Observable, processes)
          .pipe(
            map((value: any) => ({ id: value.entity.id, done: value.entity.done })),
            scan((a, next: any) => {
              return a.filter((i) => i.id !== next.id).concat({ id: next.id, done: next.done });
            }, accumulator)
          );

        this.bulkProcessingItems.subscribe({
          next(completionReport) { },
          error: (e) => console.error('An error has occurred', e),
          complete: () => {
            this.bulkProcessing = false;
            items.forEach((i) => i.asset.workflowStatus = newWorkflowState);
            showSnackBar(this.snackBar, 'All processes completed.');
          }
        });

      });
  }

  refresh() {
    this.fetch()
      .subscribe({
        next: items => {
          let numOfItems = items.length;
          this.totalNumOfAssets = numOfItems;
          this.numOfPages = Math.ceil((numOfItems / this.pageSize));
          if (numOfItems < (this.pageIndex * this.pageSize)) {
            this.pageIndex = Math.floor(this.totalNumOfAssets / this.pageSize);
          }
          this.setPage(items);
          items.forEach(i => {
            this.selected[i.id] = (i.id in this.selected) ? this.selected[i.id] : false;
          });
        }
      });
  }

  pageChanged($event) {
    this.pageSize = $event.pageSize;
    this.pageIndex = $event.pageIndex;
    this.items.subscribe((items) => this.setPage(items));
  }

  setPage(items) {
    let {pageSize, pageIndex, totalNumOfAssets} = this;
    if (totalNumOfAssets < pageSize) {
      this.pagedItems = items;
    } else {
      let startIndex = (pageIndex * pageSize);
      this.pagedItems = items.slice(
        startIndex,
        startIndex + pageSize
      );
    }
  }

  processReportDone() {
    this.bulkProcessingItems = null;
  }

}

