import { Component } from '@angular/core';
import { dispatch, NgRedux } from '@angular-redux/store';
import { AppState, LookupTable } from '../../classes/app-state.interface';
import { WithNgRedux } from '../../classes/with-ng-redux.class';
import { Project } from '../../models/project.model';
import { ExplorerActions } from '../../actions/explorer.actions';

@Component({
  selector: 'std-projects-view',
  templateUrl: './projects-view.component.html',
  styleUrls: ['./directory-view.component.scss']
})
export class ProjectsViewComponent extends WithNgRedux {

  activeProjectCode: string;
  projects = [];
  loading = false;
  error = false;

  constructor(store: NgRedux<AppState>) {
    super(store);

    this.pipeFilterAndTakeUntil(
      store.select<string>(['explorer', 'activeProjectCode']))
      .subscribe((code) => {
        this.activeProjectCode = code;
      });

    this.pipeFilterAndTakeUntil(
      store.select<LookupTable<Project>>(['entities', 'projects', 'byId']))
      .subscribe((projectsTable) => {
        this.projects = Object.values(projectsTable).sort((a, b) => {
          if (a.name < b.name) {
            return -1;
          }
          if (a.name > b.name) {
            return 1;
          }
          return 0;
        });
      });

  }

  @dispatch()
  onSelection(nextSelection) {
    let { activeProjectCode } = this;
    if (activeProjectCode === nextSelection.code) {
      return false;
    } else {
      return ExplorerActions.selectProject(nextSelection.code);
    }
  }

}
