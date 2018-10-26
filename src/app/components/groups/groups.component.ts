import { Component, OnInit } from '@angular/core';
import { dispatch, NgRedux } from '@angular-redux/store';
import { fetchGroups } from '../../actions/group.actions';
import { Group } from '../../models/group.model';
import { AppState } from '../../classes/app-state.interface';
import { WithNgRedux } from '../../classes/with-ng-redux.class';
import { withLatestFrom } from 'rxjs/operators';

@Component({
  selector: 'std-groups',
  templateUrl: './groups.component.html',
  styleUrls: ['./groups.component.scss']
})
export class GroupsComponent extends WithNgRedux implements OnInit {

  groups: Group[] = [];

  pageSize = 5;
  pageIndex = 0;
  numOfGroups = 0;
  pageSizeOptions = [5, 10, 25, 100];

  constructor(store: NgRedux<AppState>) {
    super(store);
  }

  ngOnInit() {

    const { store } = this;

    store.select(['entities', 'groups', 'byId'])
      .pipe(
        // withLatestFrom(
        //   store.select('groupsList'),
        //   (a, b) => ({ byId: a, state: b })
        // ),
        this.untilDestroyed()
      )
      .subscribe((byId) => {
        this.groups = Object.values(byId);
      });

    this.fetchGroups();
  }

  @dispatch()
  fetchGroups() {
    return fetchGroups();
  }

}
