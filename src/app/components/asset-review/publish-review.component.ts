import { Component, OnInit } from '@angular/core';
import { AppState, LookupTable } from '../../classes/app-state.interface';
import { NgRedux } from '@angular-redux/store';
import { ActivatedRoute } from '@angular/router';
import { switchMap } from 'rxjs/operators';
import { ContentService } from '../../services/content.service';
import { AssetActions } from '../../actions/asset.actions';
import { DependencyReviewBase } from '../../classes/dependency-review-base.class';
import { Asset } from '../../models/asset.model';

@Component({
  selector: 'std-publish-review',
  templateUrl: './publish-review.component.html',
  styleUrls: ['./publish-review.component.scss']
})
export class PublishReviewComponent extends DependencyReviewBase implements OnInit {

  submission = {
    now: true,
    channel: null,
    comment: ''
  };

  constructor(store: NgRedux<AppState>, route: ActivatedRoute, actions: AssetActions,
              private contentService: ContentService) {
    super(store, route, actions);

    this.data$
      .pipe(this.filterNulls())
      .subscribe((data) => this.submission.channel = data.channels[0].name);

  }

  switchAndMap() {
    return switchMap((ids: string[]) => this.contentService.prePublishReport(ids));
  }

  getAssetLookupTable(): LookupTable<Asset> {
    return this.data.dependencies.assetLookup;
  }

  schedulingChanged() {

  }

}
