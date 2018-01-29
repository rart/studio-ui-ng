import { Component } from '@angular/core';
import { AppState, LookupTable } from '../../classes/app-state.interface';
import { NgRedux } from '@angular-redux/store';
import { ActivatedRoute } from '@angular/router';
import { AssetActions } from '../../actions/asset.actions';
import { Asset } from '../../models/asset.model';
import { DeleteReviewComponent } from './delete-review.component';

@Component({
  selector: 'std-dependency-review',
  templateUrl: './dependency-review.component.html',
  styleUrls: ['./dependency-review.component.scss']
})
export class DependencyReviewComponent extends DeleteReviewComponent {

}
