import {Injectable} from '@angular/core';
import {ActivatedRouteSnapshot, Resolve, RouterStateSnapshot} from '@angular/router';
import {ProjectService} from './project.service';
import { AppState } from '../classes/app-state.interface';
import { NgRedux } from '@angular-redux/store';
import { tap } from 'rxjs/operators';
import { fetchProjectComplete, ProjectActions } from '../actions/project.actions';

@Injectable()
export class ProjectResolver implements Resolve<any> {

  constructor(private projectService: ProjectService,
              private store: NgRedux<AppState>) {

  }

  resolve(route: ActivatedRouteSnapshot,
          state: RouterStateSnapshot) {
    const projectCode = route.params.project;
    return this.projectService.byId(projectCode)
      .pipe(
        tap(project => this.store.dispatch(
          fetchProjectComplete({ project, code: project.code, response: null })
        ))
      );
  }

}
