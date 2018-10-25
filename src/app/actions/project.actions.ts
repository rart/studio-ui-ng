import { Injectable } from '@angular/core';
import { AnyAction } from 'redux';
import { Actions } from '../enums/actions.enum';
import { Project } from '../models/project.model';

@Injectable()
export class ProjectActions {

  select(code): AnyAction {
    return {
      type: Actions.SELECT_PROJECT,
      code
    };
  }

  deselect(code): AnyAction {
    return {
      type: Actions.DESELECT_PROJECT,
      code
    };
  }

  fetch(query?): AnyAction {
    return {
      type: Actions.FETCH_PROJECTS,
      query
    };
  }

  fetched(projects): AnyAction {
    return {
      type: Actions.PROJECTS_FETCHED,
      projects
    };
  }

  create(project: Project): AnyAction {
    return {
      type: Actions.CREATE_PROJECT,
      project
    };
  }

  created(project: Project): AnyAction {
    return {
      type: Actions.PROJECT_CREATED,
      project
    };
  }

  update(project: Project): AnyAction {
    return {
      type: Actions.UPDATE_PROJECT,
      project
    };
  }

  updated(project: Project): AnyAction {
    return {
      type: Actions.PROJECT_UPDATED,
      project
    };
  }

  delete(project: Project): AnyAction {
    return {
      type: Actions.DELETE_PROJECT,
      project
    };
  }

  deleted(project: Project): AnyAction {
    return {
      type: Actions.PROJECT_DELETED,
      project
    };
  }

}
