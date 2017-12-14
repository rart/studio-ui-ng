import { Injectable } from '@angular/core';
import { map } from 'rxjs/operators';
import { ProjectService } from '../services/project.service';
import { ProjectActions } from '../actions/project.actions';
import { StoreActionsEnum } from '../enums/actions.enum';
import { Project } from '../models/project.model';
import { RootEpic } from './root.epic';

@Injectable()
export class ProjectEpics {

  constructor(private projectService: ProjectService,
              private projectActions: ProjectActions) {

  }

  private edit = RootEpic.createEpic(
    StoreActionsEnum.EDIT_PROJECT,
    (query?) => {
      return this.projectService.all().pipe(
        map(this.projectActions.fetched)
      );
    });

  private all = RootEpic.createEpic(
    StoreActionsEnum.FETCH_PROJECTS,
    (query?) => {
      return this.projectService
        .all()
        .pipe(
          map(this.projectActions.fetched)
        );
    });

  private create = RootEpic.createEpic(
    StoreActionsEnum.CREATE_PROJECT,
    (project: Project) => {
      return this.projectService
        .create(project)
        .pipe(
          map(postResponse => this.projectActions.created(postResponse.entity))
        );
    });

  private update = RootEpic.createEpic(
    StoreActionsEnum.UPDATE_PROJECT,
    (project: Project) => {
      return this.projectService
        .update(project)
        .pipe(
          map(postResponse => this.projectActions.updated(postResponse.entity))
        );
    });

  private delete = RootEpic.createEpic(
    StoreActionsEnum.DELETE_PROJECT,
    (project: Project) => {
      return this.projectService
        .delete(project)
        .pipe(
          map(postResponse => this.projectActions.deleted(postResponse.entity))
        );
    });

  epics() {
    return [
      (action$, store, dependencies) => this.all(action$, store, dependencies),
      (action$, store, dependencies) => this.create(action$, store, dependencies),
      (action$, store, dependencies) => this.update(action$, store, dependencies),
      (action$, store, dependencies) => this.delete(action$, store, dependencies)
    ];
  }

}
