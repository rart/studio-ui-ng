import { Component } from '@angular/core';
import { NgRedux } from '@angular-redux/store';
import { ActivatedRoute } from '@angular/router';
import { ReviewBase } from '../../classes/review-base.class';
import { AppState } from '../../classes/app-state.interface';

@Component({
  selector: 'std-history-review',
  templateUrl: './history-review.component.html',
  styleUrls: ['./history-review.component.scss']
})
export class HistoryReviewComponent extends ReviewBase {

  constructor(store: NgRedux<AppState>, route: ActivatedRoute) {
    super(store, route);



  }

}
