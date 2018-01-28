import { Component, Input } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { NgRedux } from '@angular-redux/store';
import { AppState } from '../../classes/app-state.interface';
import { ReviewBase } from '../../classes/review-base.class';

@Component({
  selector: 'std-info-sheet-list',
  template: `
    <ng-container *ngIf="ids$ | async as ids">
      <div class="pad all" *ngFor="let id of ids; let isLast=last">
        <std-info-sheet [id]="id"></std-info-sheet>
        <div class="ui divider" *ngIf="!isLast"></div>
      </div>
      <div class="pad all lg text muted center" *ngIf="!ids.length">
        <span translate>Nothing selected for displaying.</span>
      </div>
    </ng-container>`,
  styles: [`
    .ui.divider:last-child {
      display: none;
    }
  `]
})
export class InfoSheetListComponent extends ReviewBase {

  constructor(store: NgRedux<AppState>,
              route: ActivatedRoute) {
    super(store, route);
  }

}
