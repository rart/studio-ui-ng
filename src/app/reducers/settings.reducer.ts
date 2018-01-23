import { Reducer } from 'redux';
import { Settings } from '../classes/app-state.interface';
import { StoreActionsEnum } from '../enums/actions.enum';

export const settings: Reducer<Settings> = (state = {
  'meta.click.open.tab.in.background': true,
  layout: 'full',
  containedLayoutMax: 1600,
  nativeScrollbars: false,
  viewAnimation: 'fadeIn',
  topBarShown: false,
  topBarTheme: 'mat-white-500-bg',
  topBarPosition: 'top',
  navBarTheme: 'mat-grey-100-bg',
  navBarShown: true,
  navBarPosition: 'left',
  navBarMinimised: false,
  footerShown: false,
  footerTheme: 'mat-black-500-bg',
  footerPosition: 'inline'
}, action) => {
  switch (action.type) {
    case StoreActionsEnum.UPDATE_GLOBAL_SETTINGS:
      return {
        ...state,
        [action.payload.key]: action.payload.value
      };
    case StoreActionsEnum.TOGGLE_SIDEBAR:
      return {
        ...state,
        navBarShown: !state.navBarShown
      };
    case StoreActionsEnum.TOGGLE_SIDEBAR_FOLD:
      return {
        ...state,
        navBarMinimised: !state.navBarMinimised
      };
    default:
      return state;
  }
};
