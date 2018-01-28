import { MatTabGroup } from '@angular/material';
import { group, transition, trigger } from '@angular/animations';
import { fadeInEntryQueries, slideUpEntry } from '../../utils/animations.utils';
import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';

import { filter, map, takeUntil } from 'rxjs/operators';

import { Asset } from '../../models/asset.model';
import { ComponentBase } from '../../classes/component-base.class';
import { routes } from '../../app.routes';

@Component({
  selector: 'std-asset-overview',
  templateUrl: './asset-overview.component.html',
  styleUrls: ['./asset-overview.component.scss']
})
export class AssetOverviewComponent extends ComponentBase implements AfterViewInit {

  @ViewChild('tabGroup') tabGroup: MatTabGroup;

  tabs = [];
  index = 0;
  goal = 0;

  constructor(private route: ActivatedRoute,
              private router: Router) {
    super();

    let tabs = this.tabs = routes[0].children
      .find(r => r.path === 'project/:project')
      .children.find(r => r.path === 'review')
      .children[1].children
      .map(descriptor => ({
        label: descriptor.data.label,
        path: descriptor.path
      }));

    route.params
      .subscribe((params) => {
        let noTabRoute = `/project/${params.project}/review/${params.asset}`;
        if (router.url === noTabRoute) {
          return router.navigateByUrl(`${this.router.url}/info`);
        }
      });

    router.events
      .pipe(
        takeUntil(this.unSubscriber$),
        filter(e => e instanceof NavigationEnd),
        map((e: NavigationEnd) => e.url.substr((e.url.lastIndexOf('/') + 1)))
      )
      .subscribe((path) => {
        setTimeout(() => this.goal = ++this.goal);
        this.index = tabs.findIndex(tab => tab.path === path);
      });

  }

  ngAfterViewInit() {
    this.tabGroup.selectedIndexChange
      .pipe(map(index => this.tabs[index]))
      .subscribe(tab => {
        let url = this.router.url;
        this.router.navigateByUrl(`${url.substr(0, url.lastIndexOf('/'))}/${tab.path}`);
      });
  }

}

