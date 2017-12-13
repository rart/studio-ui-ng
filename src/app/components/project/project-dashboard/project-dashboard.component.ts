import { Component, Inject, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FetchType } from './item-list-dashlet.component';
import { Project } from '../../../models/project.model';
import { AssetMenuOption, WorkflowService } from '../../../services/workflow.service';
import { SubjectStore } from '../../../classes/subject-store.class';
import { AppStore } from '../../../state.provider';
import { AppState } from '../../../classes/app-state.interface';
import { WithNgRedux } from '../../../classes/with-ng-redux.class';
import { NgRedux } from '@angular-redux/store';

@Component({
  selector: 'std-project-dashboard',
  templateUrl: './project-dashboard.component.html',
  styleUrls: ['./project-dashboard.component.scss']
})
export class ProjectDashboardComponent extends WithNgRedux implements OnInit {

  project: Project;

  activity: FetchType = 'activity';
  published: FetchType = 'published';
  scheduled: FetchType = 'scheduled';
  pending: FetchType = 'pending';

  actions: AssetMenuOption[] = [];

  constructor(store: NgRedux<AppState>,
              private route: ActivatedRoute,
              private workflowService: WorkflowService) {
    super(store);
  }

  ngOnInit() {

    this.route.data
      .subscribe(data => this.project = data.project);

    this.store.select(['workspaceRef', 'selectedItems'])
      .pipe(...this.noNullsAndUnSubOps)
      .subscribe((selectedItems) => this.updateAvailableActions(selectedItems));

  }

  actionSelected(action) {
    switch (action) {
      case '':

        break;
    }
  }

  private updateAvailableActions(selectedItems) {
    this.actions = this.workflowService.getAvailableWorkflowOptions(
      this.state.user,
      []);
  }

}
