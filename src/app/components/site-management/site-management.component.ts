import { Component, OnInit } from '@angular/core';
import { PageEvent } from '@angular/material';
import { Router, ActivatedRoute } from '@angular/router';
import { MatDialog } from '@angular/material';
import { SiteService } from '../../services/site.service';
import { openDialog, StringUtils } from '../../app.utils';
import { EmbeddedViewDialogComponent } from '../embedded-view-dialog/embedded-view-dialog.component';
import { SiteCrUDComponent } from './site-crud/site-crud.component';

@Component({
  selector: 'std-site-management',
  templateUrl: './site-management.component.html',
  styleUrls: ['./site-management.component.scss']
})
export class SiteManagementComponent implements OnInit {

  sites;
  pageSize = 5;
  pageIndex = 0;
  totalNumOfSites = 0;
  pageSizeOptions = [5, 10, 25, 100];

  dialogRef = null;

  constructor(private siteService: SiteService,
              private activeRoute: ActivatedRoute,
              public dialog: MatDialog,
              public router: Router) {
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
        const state = {
          pageSize: this.pageSize,
          pageIndex: this.pageIndex,
          sites: this.sites
        };

        if (pageSize !== undefined) {
          this.pageSize = pageSize;
        }
        if (pageIndex !== undefined) {
          this.pageIndex = pageIndex;
        }

        // TODO: fetch only when changed
        this.fetchSites();

        // Something fails when opening dialogs on the current callstack (without the setTimeout)

        if (create !== undefined) {
          setTimeout(() => this.openDialog());
        } else if (edit !== undefined && edit !== '') {
          setTimeout(() => this.openDialog({ code: edit }));
        }

      });
  }

  fetchSites() {
    this.siteService.all({
      start: (this.pageIndex * this.pageSize),
      number: this.pageSize
    }).subscribe(data => {
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
        this.fetchSites();
      });
    this.dialogRef = dialogRef;
  }

  pageChanged($event: PageEvent) {
    this.router.navigate(['/sites'], {
      queryParams: { pageIndex: $event.pageIndex, pageSize: $event.pageSize }
    });
  }

}
