import {Injectable} from '@angular/core';
import {ActivatedRouteSnapshot, Resolve, RouterStateSnapshot} from '@angular/router';
import {ProjectService} from './project.service';
import { AppState } from '../classes/app-state.interface';
import { NgRedux } from '@angular-redux/store';
import { tap } from 'rxjs/operators';
import { ProjectActions } from '../actions/project.actions';

@Injectable()
export class ProjectResolver implements Resolve<any> {

  constructor(private projectService: ProjectService) {

  }

  resolve(route: ActivatedRouteSnapshot,
          state: RouterStateSnapshot) {
    const projectCode = route.params.project;
    return this.projectService.byId(projectCode);
  }

}
