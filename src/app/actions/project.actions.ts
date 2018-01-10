import { Injectable } from '@angular/core';
import { AnyAction } from 'redux';
import { StoreActionsEnum } from '../enums/actions.enum';
import { Project } from '../models/project.model';

@Injectable()
export class ProjectActions {

  select(code): AnyAction {
    return {
      type: StoreActionsEnum.SELECT_PROJECT,
      code
    };
  }

  deselect(code): AnyAction {
    return {
      type: StoreActionsEnum.DESELECT_PROJECT,
      code
    };
  }

  fetch(query?): AnyAction {
    return {
      type: StoreActionsEnum.FETCH_PROJECTS,
      query
    };
  }

  fetched(projects): AnyAction {
    return {
      type: StoreActionsEnum.PROJECTS_FETCHED,
      projects
    };
  }

  create(project: Project): AnyAction {
    return {
      type: StoreActionsEnum.CREATE_PROJECT,
      project
    };
  }

  created(project: Project): AnyAction {
    return {
      type: StoreActionsEnum.PROJECT_CREATED,
      project
    };
  }

  update(project: Project): AnyAction {
    return {
      type: StoreActionsEnum.UPDATE_PROJECT,
      project
    };
  }

  updated(project: Project): AnyAction {
    return {
      type: StoreActionsEnum.PROJECT_UPDATED,
      project
    };
  }

  delete(project: Project): AnyAction {
    return {
      type: StoreActionsEnum.DELETE_PROJECT,
      project
    };
  }

  deleted(project: Project): AnyAction {
    return {
      type: StoreActionsEnum.PROJECT_DELETED,
      project
    };
  }

}
