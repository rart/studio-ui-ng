import { Component } from '@angular/core';
import { AppState } from '../../classes/app-state.interface';
import { NgRedux } from '@angular-redux/store';
import { ReviewBase } from '../../classes/review-base.class';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'std-publish-review',
  templateUrl: './publish-review.component.html',
  styleUrls: ['./publish-review.component.scss']
})
export class PublishReviewComponent  extends ReviewBase {

  constructor(store: NgRedux<AppState>, route: ActivatedRoute) {
    super(store, route);



  }

}
