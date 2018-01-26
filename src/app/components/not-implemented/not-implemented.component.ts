import { Component, OnInit, ViewChild } from '@angular/core';
import { Asset } from '../../models/asset.model';
import { ContentService } from '../../services/content.service';
import { AssetDisplayComponent } from '../asset-display/asset-display.component';
import { dispatch } from '@angular-redux/store';

@Component({
  selector: 'std-not-implemented',
  templateUrl: './not-implemented.component.html',
  styleUrls: ['./not-implemented.component.scss']
})
export class NotImplementedComponent implements OnInit {

  @ViewChild(AssetDisplayComponent) component: AssetDisplayComponent;

  asset;

  showIcons = true;
  showTypeIcon = true;
  showStatusIcons = true;
  showMenu = true;
  showLabel = true;
  showLink = true;
  displayField = 'label';
  disallowWrap = false;
  showCheck = false;

  path = 'launcher:/site/website';

  constructor(private contentService: ContentService) { }

  ngOnInit() {
    this.fetch();
  }

  onEnter(value) {
    this.fetch();
  }

  fetch() {
    this.contentService.tree(this.path)
      .subscribe((item) => {
        this.asset = item;
      });
  }

  @dispatch()
  toggleSidebar() {
    return { type: 'TOGGLE_SIDEBAR' };
  }
}
