import { Component } from '@angular/core';
import { NgRedux } from '@angular-redux/store';
import { ActivatedRoute } from '@angular/router';
import { AppState } from '../../classes/app-state.interface';
import { PublishReviewComponent } from './publish-review.component';

@Component({
  selector: 'std-schedule-review',
  templateUrl: './schedule-review.component.html',
  styleUrls: ['./schedule-review.component.scss']
})
export class ScheduleReviewComponent extends PublishReviewComponent {

}
