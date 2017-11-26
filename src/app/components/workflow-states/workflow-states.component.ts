import { Component, OnInit } from '@angular/core';
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
  checked = {};
  states = Object.keys(WorkflowStatusEnum)
    .filter((key) => key !== WorkflowStatusEnum.UNKNOWN);

  constructor(private route: ActivatedRoute,
              private snackBar: MatSnackBar,
              private workflowService: WorkflowService) { }

  ngOnInit() {

    this.route.data
      .subscribe(data => this.site = data.site);

    this.items = this.workflowService.assetStatusReport(this.site.code, 'ALL');

    this.items
      .subscribe(items => {
        this.checked = {};
        items.forEach(i => {
          this.checked[i.id] = false;
        });
      });

  }

  selectAll() {
    Object.keys(this.checked).forEach(key => this.checked[key] = true);
  }

  selectNone() {
    Object.keys(this.checked).forEach(key => this.checked[key] = false);
  }

  itemStatusChanged(i) {
    this.workflowService
      .setAssetStatus(this.site.code, i.asset.id, i.asset.workflowStatus, i.processing)
      .subscribe(() => {
        showSnackBar(this.snackBar, 'Status set successfully.');
      });
  }

  bulkSetStates(status) {
    alert('Not implemented yet.');
  }

}
