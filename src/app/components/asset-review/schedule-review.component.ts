import { Component, OnInit } from '@angular/core';
import { ReviewBase } from '../../classes/review-base.class';
import { NgRedux } from '@angular-redux/store';
import { ActivatedRoute } from '@angular/router';
import { AppState } from '../../classes/app-state.interface';

@Component({
  selector: 'std-schedule-review',
  templateUrl: './schedule-review.component.html',
  styleUrls: ['./schedule-review.component.scss']
})
export class ScheduleReviewComponent extends ReviewBase {

  constructor(store: NgRedux<AppState>, route: ActivatedRoute) {
    super(store, route);



  }

}
