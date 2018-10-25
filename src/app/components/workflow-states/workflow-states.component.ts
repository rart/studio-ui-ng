import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Observable } from 'rxjs/Observable';
import {
  debounceTime, map, scan, startWith, tap,
  distinctUntilChanged, shareReplay
} from 'rxjs/operators';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';

import { WorkflowService } from '../../services/workflow.service';
import { ActivatedRoute } from '@angular/router';
import { WorkflowStatusEnum } from '../../enums/workflow-status.enum';
import { MatSnackBar } from '@angular/material';
import { createLocalPagination$ } from '../../app.utils';
import { ComponentBase } from '../../classes/component-base.class';
import { PagerConfig } from '../../classes/pager-config.interface';
import { showSnackBar } from '../../utils/material.utils';
import { merge } from 'rxjs/observable/merge';
import { of } from 'rxjs/observable/of';

@Component({
  selector: 'std-workflow-states',
  templateUrl: './workflow-states.component.html',
  styleUrls: ['./workflow-states.component.scss']
})
export class WorkflowStatesComponent extends ComponentBase implements OnInit, OnDestroy {

  project;
  items;
  selected = {};
  filterQuery = new FormControl('');
  states = Object.keys(WorkflowStatusEnum)
    .filter((key) => key !== WorkflowStatusEnum.UNKNOWN);

  pageSizeOptions = [5, 10, 25, 50, 100];
  pagerConfig = {
    pageIndex: 0,
    pageSize: this.pageSizeOptions[0]
  };

  numOfPages;
  numOfItems;

  bulkProcessing = false;
  bulkProcessingItems = null;

  private pager$: BehaviorSubject<PagerConfig> = new BehaviorSubject(this.pagerConfig);

  constructor(private route: ActivatedRoute,
              private snackBar: MatSnackBar,
              private workflowService: WorkflowService) {
    super();
  }

  ngOnInit() {

    this.route.data
      .subscribe(data => this.project = data.project);

    this.refresh();

  }

  fetch() {
    this.ngOnDestroy$.next();
    return this.items = createLocalPagination$({

      pager$: this.pager$,
      takeUntilOp: this.untilDestroyed(),
      filterFn: (item, query) => item.asset.id.includes(query),

      source$: this.workflowService
        .assetStatusReport(this.project.code, 'ALL')
        .pipe(
          shareReplay(1),
          tap(items => {
            items.forEach(item => {
              this.selected[item.id] = (item.id in this.selected)
                ? this.selected[item.id]
                : false;
            });
          })
        ),

      filter$: this.filterQuery.valueChanges
        .pipe(
          debounceTime(250),
          distinctUntilChanged(),
          startWith(this.filterQuery.value)
        )

    }).pipe(
      tap(paged => {
        let numOfItems = paged.queryTotal;
        this.numOfItems = numOfItems;
        this.numOfPages = Math.ceil((numOfItems / this.pagerConfig.pageSize));
      }),
      map(data => data.entries)
    );
  }

  selectAll() {
    Object.keys(this.selected).forEach(key => this.selected[key] = true);
  }

  selectNone() {
    Object.keys(this.selected).forEach(key => this.selected[key] = false);
  }

  itemStatusChanged(i) {
    return this.workflowService
      .setAssetStatus(this.project.code, i.asset.id, i.asset.workflowStatus, i.processing)
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
                item.asset.projectCode,
                item.asset.id,
                newWorkflowState,
                item.processing).pipe(shareReplay(1)));
          });

        // An observable to fire immediately and show all as "processing..."
        processes.unshift(of({ entity: accumulator[0] }));

        this.bulkProcessingItems = merge
          .apply(Observable, processes)
          .pipe(
            map((value: any) => ({ id: value.entity.id, done: value.entity.done })),
            scan((a, next: any) => {
              return a.filter((i) => i.id !== next.id).concat({ id: next.id, done: next.done });
            }, accumulator)
          );

        this.bulkProcessingItems.subscribe({
          next(completionReport) {

          },
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
    this.fetch();
  }

  pageChanged($event) {
    this.pager$.next(
      Object.assign(this.pagerConfig, $event));
  }

  processReportDone() {
    this.bulkProcessingItems = null;
  }

}

