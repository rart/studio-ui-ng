import {Component, OnChanges, OnInit} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {SiteService} from '../../../services/site.service';

@Component({
  selector: 'std-site-dashboard',
  templateUrl: './site-dashboard.component.html',
  styleUrls: ['./site-dashboard.component.scss']
})
export class SiteDashboardComponent implements OnInit, OnChanges {

  site;

  viewTitle = 'Site Dashboard';

  constructor(private route: ActivatedRoute) { }

  ngOnInit() {
    this.route.data
      .subscribe(data => {
        this.site = data.site;
        this.setTitle();
      });
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
