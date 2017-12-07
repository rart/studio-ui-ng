import { Component, OnInit } from '@angular/core';
import { MatDialog, PageEvent } from '@angular/material';
import { ActivatedRoute, Router } from '@angular/router';
import { SiteService } from '../../services/site.service';
import { createLocalPagination$, openDialog, StringUtils } from '../../app.utils';
import { EmbeddedViewDialogComponent } from '../embedded-view-dialog/embedded-view-dialog.component';
import { SiteCrUDComponent } from './site-crud/site-crud.component';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { debounceTime, distinctUntilChanged, startWith } from 'rxjs/operators';
import { ComponentBase } from '../../classes/component-base.class';
import { FormControl } from '@angular/forms';
import { PagedResponse } from '../../classes/paged-response.interface';
import { Site } from '../../models/site.model';
import 'rxjs/add/observable/never';
import { PagerConfig } from '../../classes/pager-config.interface';

@Component({
  selector: 'std-site-management',
  templateUrl: './site-management.component.html',
  styleUrls: ['./site-management.component.scss']
})
export class SiteManagementComponent extends ComponentBase implements OnInit {

  sites;
  dialogRef = null;
  filterQuery = new FormControl('');

  totalNumOfSites = 0;
  pageSizeOptions = [5, 10, 25, 100];
  pagerConfig: PagerConfig = {
    pageIndex: 0,
    pageSize: this.pageSizeOptions[0]
  };

  pager$ = new BehaviorSubject(this.pagerConfig);

  constructor(private siteService: SiteService,
              private activeRoute: ActivatedRoute,
              public dialog: MatDialog,
              public router: Router) {
    super();
  }

  ngOnInit() {

    // @see https://github.com/angular/angular/issues/20299

    this.activeRoute.url
      .subscribe(() => {
        let url = this.router.url;
        if (StringUtils.contains(url, '/create')) {
          setTimeout(() => this.openDialog());
        } else if (this.activeRoute.firstChild) {
          this.activeRoute.firstChild.params
            .subscribe((params) => {
              if (params.siteCode) {
                setTimeout(() =>
                  this.openDialog({ code: params.code || params.edit }));
              }
            });
        }
      });

    this.activeRoute.queryParams
      .subscribe(params => {
        const pageSize = params['pageSize'];
        const pageIndex = params['pageIndex'];
        const create = params['create'];
        const edit = params['edit'];

        if (pageSize !== undefined) {
          this.pagerConfig.pageSize = pageSize;
        }
        if (pageIndex !== undefined) {
          this.pagerConfig.pageIndex = pageIndex;
        }
        if (pageSize !== undefined || pageIndex !== undefined) {
          this.pager$.next(this.pagerConfig);
        }

        // Something fails when opening dialogs on the current callstack (without the setTimeout)
        if (create !== undefined) {
          setTimeout(() => this.openDialog());
        } else if (edit !== undefined && edit !== '') {
          setTimeout(() => this.openDialog({ code: edit }));
        }

      });

    this.fetchSites();

  }

  fetchSites() {
    createLocalPagination$({
      source$: this.siteService.sites(),
      pager$: this.pager$,
      takeUntilOp: this.takeUntil,
      filterFn: (item, query) => query.trim() === '' || item.name.includes(query),
      filter$: this.filterQuery.valueChanges
        .pipe(
          debounceTime(250),
          distinctUntilChanged(),
          startWith(this.filterQuery.value)
        )
    }).subscribe((data: PagedResponse<Site>) => {
      this.sites = data.entries;
      this.totalNumOfSites = data.total;
    });
  }

  createSite() {
    this.router.navigate(['/sites'], { queryParams: { create: 'true' } });
  }

  openDialog(data = {}) {
    let dialogRef, subscription;
    dialogRef = openDialog(this.dialog, EmbeddedViewDialogComponent, {
      width: '800px',
      disableClose: true,
      data: Object.assign({
        component: SiteCrUDComponent
      }, data)
    });
    subscription = dialogRef.afterClosed()
      .subscribe(() => {
        this.router.navigate(['/sites']);
        subscription.unsubscribe();
      });
    this.dialogRef = dialogRef;
  }

  pageChanged($event: PageEvent) {
    this.pager$.next(
      Object.assign(this.pagerConfig, $event));
  }

}
