import { Component, OnInit } from '@angular/core';
import { MatDialog, PageEvent } from '@angular/material';
import { ActivatedRoute, Router } from '@angular/router';
import { MediaChange, MediaObserver } from '@angular/flex-layout';
import { createLocalPagination$ } from '../../app.utils';
import { EmbeddedViewDialogComponent } from '../embedded-view-dialog/embedded-view-dialog.component';
import { ProjectCrUDComponent } from './project-crud/project-crud.component';
import { BehaviorSubject ,  Observable } from 'rxjs';
import { debounceTime, distinctUntilChanged, filter, startWith } from 'rxjs/operators';
import { FormControl } from '@angular/forms';
import { PagedResponse } from '../../classes/paged-response.interface';
import { Project } from '../../models/project.model';
import { PagerConfig } from '../../classes/pager-config.interface';
import { dispatch, NgRedux, select } from '@angular-redux/store';
import { ProjectActions } from '../../actions/project.actions';
import { AppState } from '../../classes/app-state.interface';
import { WithNgRedux } from '../../classes/with-ng-redux.class';
import { isNullOrUndefined } from 'util';
import { openDialog } from '../../utils/material.utils';
import { StringUtils } from '../../utils/string.utils';
import { createPreviewTabCore } from '../../utils/state.utils';
import { PreviewTabsActions } from '../../actions/preview-tabs.actions';

const anonym = (state: AppState) => {
  return Object.values(state.entities.projects.byId);
};

@Component({
  selector: 'std-project-management',
  templateUrl: './projects.component.html',
  styleUrls: ['./projects.component.scss']
})
export class ProjectsComponent extends WithNgRedux implements OnInit {

  projects;
  dialogRef = null;
  filterQuery = new FormControl('');

  totalNumOfProjects = 0;
  pageSizeOptions = [5, 10, 25, 100];
  pagerConfig: PagerConfig = {
    pageIndex: 0,
    pageSize: this.pageSizeOptions[0]
  };

  pager$ = new BehaviorSubject(this.pagerConfig);

  columns = '';

  constructor(store: NgRedux<AppState>,
              public router: Router,
              public dialog: MatDialog,
              private projectActions: ProjectActions,
              private activeRoute: ActivatedRoute,
              private previewTabsActions: PreviewTabsActions,
              private mediaObserver: MediaObserver) {
    super(store);
  }

  @select(anonym)
  projects$: Observable<Project[]>;

  @select(['entities', 'projects', 'loading', 'all'])
  loading$: Observable<boolean>;

  ngOnInit() {

    this.mediaObserver.asObservable().subscribe((change: MediaChange[]) => {
      this.columns = ({
        'xs': '',
        'sm': 'two column',
        'md': 'three column',
        'lg': 'five column',
        'xl': 'six column'
      }) [change[0].mqAlias];
    });

    this.activeRoute.url
    // @see https://github.com/angular/angular/issues/20299
      .subscribe(() => {
        let url = this.router.url;
        if (StringUtils.contains(url, '/create')) {
          setTimeout(() => this.openDialog());
        } else if (this.activeRoute.firstChild) {
          this.activeRoute.firstChild.params
            .subscribe((params) => {
              if (params.projectCode) {
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

  @dispatch()
  load() {
    return this.projectActions.fetch();
  }

  initPaginator() {
    createLocalPagination$({
      source$: this.projects$
        .pipe(filter(projects => !isNullOrUndefined(projects))),
      pager$: this.pager$,
      takeUntilOp: this.untilDestroyed(),
      filterFn: (item, query) => query.trim() === '' || item.name.includes(query),
      filter$: this.filterQuery.valueChanges
        .pipe(
          debounceTime(250),
          distinctUntilChanged(),
          startWith(this.filterQuery.value)
        )
    }).subscribe((data: PagedResponse<Project>) => {
      this.projects = data.entries;
      this.totalNumOfProjects = data.total;
    });
  }

  createProject() {
    this.router.navigate(['/projects'], { queryParams: { create: 'true' } });
  }

  openDialog(data = {}) {
    let dialogRef, subscription;
    dialogRef = openDialog(this.dialog, EmbeddedViewDialogComponent, {
      width: '800px',
      disableClose: true,
      data: Object.assign({
        component: ProjectCrUDComponent
      }, data)
    });
    subscription = dialogRef.afterClosed()
      .subscribe(() => {
        this.router.navigate(['/projects']);
        subscription.unsubscribe();
      });
    this.dialogRef = dialogRef;
  }

  pageChanged($event: PageEvent) {
    this.pager$.next(
      Object.assign(this.pagerConfig, $event));
  }

  @dispatch()
  browse(code) {
    let tab = createPreviewTabCore({
      url: '/',
      projectCode: code
    });
    return this.previewTabsActions.nav(tab);
  }

}
