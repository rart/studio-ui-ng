import { Component } from '@angular/core';
import { AppState } from '../../classes/app-state.interface';
import { NgRedux } from '@angular-redux/store';
import { ReviewBase } from '../../classes/review-base.class';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'std-dependency-review',
  templateUrl: './dependency-review.component.html',
  styleUrls: ['./dependency-review.component.scss']
})
export class DependencyReviewComponent  extends ReviewBase {

  constructor(store: NgRedux<AppState>, route: ActivatedRoute) {
    super(store, route);



  }

}
