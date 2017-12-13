import {Injectable} from '@angular/core';
import {ActivatedRouteSnapshot, Resolve, RouterStateSnapshot} from '@angular/router';
import {ProjectService} from './project.service';
import { tap } from 'rxjs/operators';
import { AppState } from '../classes/app-state.interface';
import { NgRedux } from '@angular-redux/store';
import { ProjectActions } from '../actions/project.actions';

@Injectable()
export class ProjectsResolver implements Resolve<any> {

  constructor(private projectService: ProjectService,
              private projectActions: ProjectActions,
              private store: NgRedux<AppState>) {

  }

  resolve(route: ActivatedRouteSnapshot,
          state: RouterStateSnapshot) {
    return this.projectService
      .all()
      .pipe(tap(projects => this.store.dispatch(this.projectActions.fetched(projects))));
  }

}
