import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { dispatch, NgRedux } from '@angular-redux/store';
import { fetchGroups } from '../../actions/group.actions';
import { Group } from '../../models/group.model';
import { AppState } from '../../classes/app-state.interface';
import { Query } from '../../models/query';
import { ListingView } from '../../classes/listing-view.class';

@Component({
  selector: 'std-groups',
  styleUrls: ['./groups.component.scss'],
  template: ListingView.createTemplate({
    listTemplate: `
      <mat-card class="pad all" max="readability">
        <div class="ui link divided items">
          <div class="item" *ngFor="let group of entities" (click)="edit(group)">
            <div class="content">
              <div class="header">{{group.name}}</div>
              <div class="meta">{{group.description}}</div>
            </div>
          </div>
        </div>
      </mat-card>
    `
  })
})
export class GroupsComponent extends ListingView<Group> {

  titleBarIcon: string = 'group';
  titleBarTitle: string = 'Groups';

  constructor(store: NgRedux<AppState>, private router: Router) {
    super(store, 'groups', 'groupsList');
  }

  @dispatch()
  fetch(query: Query = this.query, forceUpdate = false) {
    return fetchGroups(query, forceUpdate);
  }

  create(): void {
    this.router.navigate(['/groups/create']);
  }

  edit(group: Group): void {
    this.router.navigate(['/groups/edit', group.id]);
  }

}
