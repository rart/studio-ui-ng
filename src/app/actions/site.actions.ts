import { Injectable } from '@angular/core';
import { dispatch } from '@angular-redux/store';
import { AnyAction } from 'redux';
import { StoreActionsEnum } from '../enums/actions.enum';
import { Site } from '../models/site.model';

@Injectable()
export class SiteActions {

  select(code): AnyAction {
    return {
      type: StoreActionsEnum.SELECT_SITE,
      code
    };
  }

  deselect(code): AnyAction {
    return {
      type: StoreActionsEnum.DESELECT_SITE,
      code
    };
  }

  fetch(query?): AnyAction {
    return {
      type: StoreActionsEnum.FETCH_SITES,
      query
    };
  }

  fetched(sites): AnyAction {
    return {
      type: StoreActionsEnum.SITES_FETCHED,
      sites
    };
  }

  create(site: Site): AnyAction {
    return {
      type: StoreActionsEnum.CREATE_SITE,
      site
    };
  }

  created(site: Site): AnyAction {
    return {
      type: StoreActionsEnum.SITE_CREATED,
      site
    };
  }

  update(site: Site): AnyAction {
    return {
      type: StoreActionsEnum.UPDATE_SITE,
      site
    };
  }

  updated(site: Site): AnyAction {
    return {
      type: StoreActionsEnum.SITE_UPDATED,
      site
    };
  }

  delete(site: Site): AnyAction {
    return {
      type: StoreActionsEnum.DELETE_SITE,
      site
    };
  }

  deleted(site: Site): AnyAction {
    return {
      type: StoreActionsEnum.SITE_DELETED,
      site
    };
  }

}
