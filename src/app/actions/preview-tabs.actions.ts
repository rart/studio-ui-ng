import { AnyAction } from 'redux';
import { Injectable } from '@angular/core';
import { StoreActionsEnum } from '../enums/actions.enum';
import { AppState, PreviewTabCore } from '../classes/app-state.interface';

const affects: Array<keyof AppState> = ['projectsState'];

@Injectable()
export class PreviewTabsActions {

  nav(tab: PreviewTabCore): AnyAction {
    return {
      type: StoreActionsEnum.NAVIGATE_ON_ACTIVE,
      affects,
      tab
    };
  }

  open(tab: PreviewTabCore): AnyAction {
    return {
      type: StoreActionsEnum.OPEN_TAB,
      affects,
      tab
    };
  }

  openInBackground(tab: PreviewTabCore): AnyAction {
    return {
      type: StoreActionsEnum.OPEN_TAB_BACKGROUND,
      affects,
      tab
    };
  }

  close(id: string): AnyAction {
    return {
      type: StoreActionsEnum.CLOSE_TAB,
      affects,
      id
    };
  }

  select(id: string): AnyAction {
    return {
      type: StoreActionsEnum.SELECT_TAB,
      affects,
      id
    };
  }

  checkIn(tab: PreviewTabCore): AnyAction {
    return {
      type: StoreActionsEnum.GUEST_CHECK_IN,
      tab
    };
  }

  back(id: string) {
    return {
      type: StoreActionsEnum.TAB_NAVIGATE_BACK,
      id
    };
  }

  forward(id: string) {
    return {
      type: StoreActionsEnum.TAB_NAVIGATE_FORWARD,
      id
    };
  }

}
