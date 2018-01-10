import { AnyAction } from 'redux';
import { Injectable } from '@angular/core';
import { StoreActionsEnum } from '../enums/actions.enum';
import { AppState, PreviewTabCore } from '../classes/app-state.interface';
import { Router } from '@angular/router';
import { NgRedux } from '@angular-redux/store';
import { notNullOrUndefined } from '../app.utils';

const affects: Array<keyof AppState> = ['workspaces'];

@Injectable()
export class PreviewTabsActions {

  constructor(private store: NgRedux<AppState>) {

  }

  private process(action) {
    let state = this.store.getState();
    if (notNullOrUndefined(state.activeProjectCode)) {
      action.projectCode = state.activeProjectCode;
    }
    return action;
  }

  nav(tab: PreviewTabCore): AnyAction {
    return this.process({
      type: StoreActionsEnum.NAVIGATE_ON_ACTIVE,
      affects,
      tab
    });
  }

  open(tab: PreviewTabCore): AnyAction {
    return this.process({
      type: StoreActionsEnum.OPEN_TAB,
      affects,
      tab
    });
  }

  openInBackground(tab: PreviewTabCore): AnyAction {
    return this.process({
      type: StoreActionsEnum.OPEN_TAB_BACKGROUND,
      affects,
      tab
    });
  }

  close(id: string): AnyAction {
    return this.process({
      type: StoreActionsEnum.CLOSE_TAB,
      affects,
      id
    });
  }

  select(id: string): AnyAction {
    return this.process({
      type: StoreActionsEnum.SELECT_TAB,
      affects,
      id
    });
  }

  checkIn(tab: PreviewTabCore): AnyAction {
    return this.process({
      type: StoreActionsEnum.GUEST_CHECK_IN,
      tab
    });
  }

  back(id: string) {
    return this.process({
      type: StoreActionsEnum.TAB_NAVIGATE_BACK,
      id
    });
  }

  forward(id: string) {
    return this.process({
      type: StoreActionsEnum.TAB_NAVIGATE_FORWARD,
      id
    });
  }

}
