import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'std-site-dashboard',
  templateUrl: './site-dashboard.component.html',
  styleUrls: ['./site-dashboard.component.scss']
})
export class SiteDashboardComponent implements OnInit {
  siteName = 'Ray\'s Photography';

  constructor() { }

  ngOnInit() {
  }

}
