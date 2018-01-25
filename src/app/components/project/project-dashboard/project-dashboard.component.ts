import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FetchType } from './item-list-dashlet.component';
import { Project } from '../../../models/project.model';
import { AssetActionEnum, AssetMenuOption, WorkflowService } from '../../../services/workflow.service';
import { AppState } from '../../../classes/app-state.interface';
import { WithNgRedux } from '../../../classes/with-ng-redux.class';
import { NgRedux } from '@angular-redux/store';
import { ProjectActions } from '../../../actions/project.actions';

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

  constructor(store: NgRedux<AppState>,
              private router: Router,
              private route: ActivatedRoute,
              private workflowService: WorkflowService,
              private projectActions: ProjectActions) {
    super(store);
  }

  ngOnInit() {

    this.route.data
      .subscribe(data => {
        let project = data.project;
        if (this.state.projectRef.code !== project.code) {
          this.store.dispatch(
            this.projectActions.select(project.code));
        }
        this.project = project;
      });

    // this.store.select(['workspaceRef', 'selectedItems'])
    //   .pipe(...this.noNullsAndUnSubOps)
    //   .subscribe((selectedItems) => this.updateAvailableActions(selectedItems));

  }

}
