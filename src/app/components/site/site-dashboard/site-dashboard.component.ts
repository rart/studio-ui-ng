import {Component, OnChanges, OnInit} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {WorkflowService} from '../../../services/workflow.service';
import {Observable} from 'rxjs/Observable';
import {ContentItem} from '../../../models/content-item.model';
import {Site} from '../../../models/site.model';

declare var $;

@Component({
  selector: 'std-site-dashboard',
  templateUrl: './site-dashboard.component.html',
  styleUrls: ['./site-dashboard.component.scss']
})
export class SiteDashboardComponent implements OnInit, OnChanges {

  site: Site;

  viewTitle = 'Site Dashboard';

  activity: Observable<ContentItem>;
  published: Observable<ContentItem>;
  scheduled: Observable<ContentItem>;
  pendingApproval: Observable<ContentItem>;

  constructor(private route: ActivatedRoute,
              private workflowService: WorkflowService) { }

  ngOnInit() {

    this.route.data
      .subscribe(data => {
        this.site = data.site;
        this.setTitle();
      });

    this.pendingApproval = this.workflowService
      .fetchPendingApproval({ siteCode: this.site.code })
      .map((data) => data.entries);

    this.scheduled = this.workflowService
      .fetchScheduled({ siteCode: this.site.code })
      .map(data => data.entries);

    this.activity = this.workflowService
      .fetchUserActivities({ siteCode: this.site.code })
      .map(data => data.entries);

    this.published = this.workflowService
      .fetchDeploymentHistory({ siteCode: this.site.code })
      .map(data => data.entries);

  }

  ngOnChanges() {
    console.log('ngOnChanges()', this.site);
    if (this.site) {
      this.setTitle();
    }
  }

  setTitle() {
    this.viewTitle = `Site Dashboard (${this.site.name})`;
  }

}
