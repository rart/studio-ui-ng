import { Component, OnInit } from '@angular/core';
import { MatDialog, PageEvent } from '@angular/material';
import { ActivatedRoute, Router } from '@angular/router';
import { SiteService } from '../../services/site.service';
import { createLocalPagination$} from '../../app.utils';
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
import { dispatch, NgRedux, select } from '@angular-redux/store';
import { Observable } from 'rxjs/Observable';
import { SiteActions } from '../../actions/site.actions';
import { AppState } from '../../classes/app-state.interface';
import { WithNgRedux } from '../../classes/with-ng-redux.class';
import { isNullOrUndefined } from 'util';
import { openDialog } from '../../utils/material.utils';
import { StringUtils } from '../../utils/string.utils';

const anonym = (state: AppState) => {
  return Object.values(state.entities.site.byId);
};

@Component({
  selector: 'std-site-management',
  templateUrl: './site-management.component.html',
  styleUrls: ['./site-management.component.scss']
})
export class SiteManagementComponent extends WithNgRedux implements OnInit {

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

  constructor(store: NgRedux<AppState>,
              public router: Router,
              public dialog: MatDialog,
              private siteActions: SiteActions,
              private activeRoute: ActivatedRoute) {
    super(store);
  }

  @select(anonym)
  sites$: Observable<Site[]>;

  @select(['entities', 'site', 'loading'])
  loading$: Observable<boolean>;

  ngOnInit() {

    this.activeRoute.url
    // @see https://github.com/angular/angular/issues/20299
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

    this.initPaginator();

  }

  @dispatch() load() {
    return this.siteActions.fetch();
  }

  initPaginator() {
    createLocalPagination$({
      source$: this.sites$
        .filter(sites => !isNullOrUndefined(sites)),
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
