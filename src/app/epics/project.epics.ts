import { Injectable } from '@angular/core';
import { map } from 'rxjs/operators';
import { ProjectService } from '../services/project.service';
import { ProjectActions } from '../actions/project.actions';
import { Actions } from '../enums/actions.enum';
import { Project } from '../models/project.model';
import { RootEpic } from './root.epic';
import { BaseEpic } from './base-epic';

@Injectable()
export class ProjectEpics extends BaseEpic {

  protected manifest: string[] = [
    'all',
    'edit',
    'create',
    'update',
    'delete'
  ];

  constructor(private projectService: ProjectService,
              private projectActions: ProjectActions) {
    super();
  }

  private edit = RootEpic.createEpic(
    Actions.EDIT_PROJECT,
    (query?) => {
      return this.projectService.all().pipe(
        map(this.projectActions.fetched)
      );
    });

  private all = RootEpic.createEpic(
    Actions.FETCH_PROJECTS,
    (query?) => {
      return this.projectService
        .all()
        .pipe(
          map(this.projectActions.fetched)
        );
    });

  private create = RootEpic.createEpic(
    Actions.CREATE_PROJECT,
    (project: Project) => {
      return this.projectService
        .create(project)
        .pipe(
          map(postResponse => this.projectActions.created(postResponse.entity))
        );
    });

  private update = RootEpic.createEpic(
    Actions.UPDATE_PROJECT,
    (project: Project) => {
      return this.projectService
        .update(project)
        .pipe(
          map(postResponse => this.projectActions.updated(postResponse.entity))
        );
    });

  private delete = RootEpic.createEpic(
    Actions.DELETE_PROJECT,
    (project: Project) => {
      return this.projectService
        .delete(project)
        .pipe(
          map(postResponse => this.projectActions.deleted(postResponse.entity))
        );
    });

}
