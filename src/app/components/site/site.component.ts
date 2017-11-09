import { Component, OnInit } from '@angular/core';
import {SiteService} from '../../services/site.service';
import {ActivatedRoute} from '@angular/router';

@Component({
  selector: 'std-site',
  templateUrl: './site.component.html',
  styleUrls: ['./site.component.scss']
})
export class SiteComponent implements OnInit {

  site;

  constructor(
    private route: ActivatedRoute,
    private siteService: SiteService) { }

  ngOnInit() {
    this.route.data
      .subscribe(data => this.site = data.site);
  }

}
