import { Reducer } from 'redux';
import { SidebarState } from '../classes/app-state.interface';
import { StoreActionsEnum } from '../enums/actions.enum';

export const sidebar: Reducer<SidebarState> = (state = {
  visible: true
}, action) => {
  switch (action.type) {
    case StoreActionsEnum.SHOW_SIDEBAR:
      return {
        ...state,
        visible: true
      };
    case StoreActionsEnum.HIDE_SIDEBAR:
      return {
        ...state,
        visible: false
      };
    case StoreActionsEnum.TOGGLE_SIDEBAR:
      return {
        ...state,
        visible: !state.visible
      };
    default:
      return state;
  }
};
