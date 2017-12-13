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
      (action$) => this.all(action$),
      (action$) => this.create(action$),
      (action$) => this.update(action$),
      (action$) => this.delete(action$)
    ];
  }

  // private select = RootEpic.createEpic(
  //   StoreActionsEnum.SELECT_PROJECT,
  //   (project: Project) => {
  //
  //   });

  // private all(action$) {
  //   console.log(action$);
  //   return action$.ofType(StoreActionsEnum.FETCH_PROJECTS).pipe(
  //     switchMap(value => {
  //       return this.projectService.all().pipe(
  //         map(this.projectActions.fetched)
  //       );
  //     })
  //   );
  // }

  // private create(action$) {
  //   return action$.ofType(StoreActionsEnum.CREATE_PROJECT).pipe(
  //     switchMap((project: Project) => {
  //       return this.projectService.create(project).pipe(
  //         map(postResponse => this.projectActions.created(postResponse.entity))
  //       );
  //     })
  //   );
  // }

  // private update(action$) {
  //   return action$.ofType(StoreActionsEnum.UPDATE_PROJECT).pipe(
  //     switchMap((project: Project) => {
  //       return this.projectService.update(project).pipe(
  //         map(postResponse => this.projectActions.created(postResponse.entity))
  //       );
  //     })
  //   );
  // }

  // private delete(action$) {
  //   return action$.ofType(StoreActionsEnum.DELETE_PROJECT).pipe(
  //     switchMap((project: Project) => {
  //       return this.projectService.delete(project).pipe(
  //         map(postResponse => this.projectActions.deleted(postResponse.entity))
  //       );
  //     })
  //   );
  // }

}
