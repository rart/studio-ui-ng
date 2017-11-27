import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/merge';
import 'rxjs/add/observable/from';
import { map, scan, shareReplay } from 'rxjs/operators';

import { WorkflowService } from '../../services/workflow.service';
import { ActivatedRoute } from '@angular/router';
import { WorkflowStatusEnum } from '../../enums/workflow-status.enum';
import { MatSnackBar } from '@angular/material';
import { showSnackBar } from '../../app.utils';


@Component({
  selector: 'std-workflow-states',
  templateUrl: './workflow-states.component.html',
  styleUrls: ['./workflow-states.component.scss']
})
export class WorkflowStatesComponent implements OnInit {

  site;
  items;
  selected = {};
  states = Object.keys(WorkflowStatusEnum)
    .filter((key) => key !== WorkflowStatusEnum.UNKNOWN);

  bulkProcessing = false;
  bulkProcessingItems = null;

  constructor(private route: ActivatedRoute,
              private snackBar: MatSnackBar,
              private workflowService: WorkflowService) { }

  ngOnInit() {

    this.route.data
      .subscribe(data => this.site = data.site);

    this.refresh();

  }

  fetch() {
    return this.items = this.workflowService
      .assetStatusReport(this.site.code, 'ALL')
      .pipe(shareReplay(1));
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
      .subscribe(items => {
        items.forEach(i => {
          this.selected[i.id] = (i.id in this.selected) ? this.selected[i.id] : false;
        });
      });
  }

  processReportDone() {
    this.bulkProcessingItems = null;
  }

}

