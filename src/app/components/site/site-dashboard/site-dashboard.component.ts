import {Component, OnInit} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {FetchType} from './item-list-dashlet.component';
import {Site} from '../../../models/site.model';

@Component({
  selector: 'std-site-dashboard',
  templateUrl: './site-dashboard.component.html',
  styleUrls: ['./site-dashboard.component.scss']
})
export class SiteDashboardComponent implements OnInit {

  site: Site;

  activity: FetchType = 'activity';
  published: FetchType = 'published';
  scheduled: FetchType = 'scheduled';
  pending: FetchType = 'pending';

  constructor(private route: ActivatedRoute) { }

  ngOnInit() {
    this.route.data
      .subscribe(data => this.site = data.site);
  }

}
