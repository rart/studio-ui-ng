import { Component, Input } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ComponentBase } from '../../classes/component-base.class';
import { NgRedux } from '@angular-redux/store';
import { AppState } from '../../classes/app-state.interface';

@Component({
  selector: 'std-info-sheet-list',
  template: `
    <div class="pad all">
      <ng-container *ngFor="let id of ids">
        <std-info-sheet [id]="id"></std-info-sheet>
        <div class="ui divider"></div>
      </ng-container>
    </div>`,
  styles: [`
    .ui.divider:last-child {
      display: none;
    }
  `]
})
export class InfoSheetListComponent extends ComponentBase {

  @Input() ids;

  constructor(store: NgRedux<AppState>,
              private route: ActivatedRoute) {
    super();

    route.parent.params
      .subscribe((params) => {
        if (params.asset === 'selected') {
          store.select(['workspaceRef', 'selectedItems'])
            .pipe(this.endWhenDestroyed)
            .subscribe((selected) => {
              this.ids = Object.keys(selected);
            });
        } else {
          this.ids = ['launcher:/site/website/index.xml']; // [params.asset];
        }
      });

  }

}
