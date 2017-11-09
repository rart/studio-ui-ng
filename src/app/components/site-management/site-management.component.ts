import {Component, OnInit} from '@angular/core';
import 'rxjs/add/observable/of';
import 'rxjs/add/observable/fromEvent';
import 'rxjs/add/observable/defer';
import 'rxjs/add/operator/delay';
import {PageEvent} from '@angular/material';
import {Router, ActivatedRoute} from '@angular/router';
import {MatDialog} from '@angular/material';
import {SiteService} from '../../services/site.service';
import {openDialog, StringUtils} from '../../app.utils';
import {EmbeddedViewDialogComponent} from '../embedded-view-dialog/embedded-view-dialog.component';
import {SiteCrUDComponent} from './site-crud/site-crud.component';

declare var $;

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
    // activatedRoute not carrying the correct URL when updated
    // this.activeRoute.params
    //   .subscribe(params => {
    //     let {code} = params;
    //     if (code) {
    //       this.openDialog({code: code});
    //     }
    //   });

    this.activeRoute.url
      .subscribe(() => {
        let url = this.router.url;
        setTimeout(() => {
          if ('/sites/create' === url) {
            this.openDialog();
          } else if (StringUtils.contains(url, '/sites/')) {
            /* Routes as /sites/:code */
            this.openDialog({code: url.replace('/sites/', '')});
          }
        });
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

        // Something fails when opening dialogs without the setTimeout

        if (create !== undefined) {
          setTimeout(() => this.openDialog());
        }

        if (edit !== undefined && edit !== '') {
          setTimeout(() => this.openDialog({code: edit}));
        }

      });
  }

  fetchSites() {
    this.siteService.all({
      start: (this.pageIndex * this.pageSize),
      number: this.pageSize
    }).then((data) => {
      this.sites = data.entries;
      this.totalNumOfSites = data.total;
    });
  }

  createSite() {
    this.router.navigate(['/sites'], {queryParams: {create: 'true'}});
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
    this.router.navigate(['/sites'], {
      queryParams: {pageIndex: $event.pageIndex, pageSize: $event.pageSize}
    });
  }

}
