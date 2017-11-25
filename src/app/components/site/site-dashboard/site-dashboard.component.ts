import { Component, Inject, OnInit } from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {FetchType} from './item-list-dashlet.component';
import {Site} from '../../../models/site.model';
import { WorkflowService } from '../../../services/workflow.service';
import { SubjectStore } from '../../../classes/subject-store.class';
import { AppStore } from '../../../state.provider';
import { AppState } from '../../../classes/app-state.interface';
import { ComponentWithState } from '../../../classes/component-with-state.class';

@Component({
  selector: 'std-site-dashboard',
  templateUrl: './site-dashboard.component.html',
  styleUrls: ['./site-dashboard.component.scss']
})
export class SiteDashboardComponent extends ComponentWithState implements OnInit {

  site: Site;

  activity: FetchType = 'activity';
  published: FetchType = 'published';
  scheduled: FetchType = 'scheduled';
  pending: FetchType = 'pending';

  actions = [];

  constructor(@Inject(AppStore) protected store: SubjectStore<AppState>,
              private route: ActivatedRoute,
              private workflowService: WorkflowService) {
    super(store);
  }

  ngOnInit() {

    this.route.data
      .subscribe(data => this.site = data.site);

    this.subscribeTo('selectedItems', () => this.updateAvailableActions());

    this.updateAvailableActions();

  }

  actionSelected(action) {
    switch (action) {
      case '':

        break;
    }
  }

  private updateAvailableActions() {
    this.actions = this.workflowService.getAvailableWorkflowOptions(
      this.state.user,
      this.state.selectedItems);
  }

}
