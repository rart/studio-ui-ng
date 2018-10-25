import { Reducer } from 'redux';
import { SidebarState } from '../classes/app-state.interface';
import { Actions } from '../enums/actions.enum';

export const sidebar: Reducer<SidebarState> = (state = {
  visible: true
}, action) => {
  switch (action.type) {
    case Actions.SHOW_SIDEBAR:
      return {
        ...state,
        visible: true
      };
    case Actions.HIDE_SIDEBAR:
      return {
        ...state,
        visible: false
      };
    case Actions.TOGGLE_SIDEBAR:
      return {
        ...state,
        visible: !state.visible
      };
    default:
      return state;
  }
};
