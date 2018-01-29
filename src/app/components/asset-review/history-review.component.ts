import { Component } from '@angular/core';
import { NgRedux } from '@angular-redux/store';
import { ActivatedRoute } from '@angular/router';
import { ReviewBase } from '../../classes/review-base.class';
import { AppState } from '../../classes/app-state.interface';
import { filter, switchMap, tap } from 'rxjs/operators';
import { ContentService } from '../../services/content.service';
import { DataSource } from '@angular/cdk/collections';
import { Observable } from 'rxjs/Observable';
import { MatTableDataSource } from '@angular/material';

@Component({
  selector: 'std-history-review',
  templateUrl: './history-review.component.html',
  styleUrls: ['./history-review.component.scss']
})
export class HistoryReviewComponent extends ReviewBase {

  data;
  dataSources = {};
  columns = ['check', 'comment', 'modifiedBy', 'modifiedOn', 'version', 'actions'];

  constructor(store: NgRedux<AppState>,
              route: ActivatedRoute,
              private contentService: ContentService) {
    super(store, route);

    this.ids$
      .pipe(
        tap(() => this.loading = true),
        filter(x => !!x.length),
        switchMap(ids => this.contentService.history(ids))
      )
      .subscribe(data => {

        data.entries.forEach(entry => {
          this.dataSources[entry.assetId] = new MatTableDataSource(entry.versions);
        });

        this.data = data;
        this.loading = false;

      });

  }

  historyItemClicked(something) {

  }

}
