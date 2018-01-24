import { Reducer } from 'redux';
import { Settings } from '../classes/app-state.interface';
import { StoreActionsEnum } from '../enums/actions.enum';

// TODO: Should this really be in the state?
const DEFAULTS: Settings = {
  metaClickOpenTabInBackground: true,
  layout: 'contained',
  containedLayoutMax: 2000,
  nativeScrollbars: false,
  viewAnimation: 'fadeIn',
  topBarTheme: '',
  topBarThemeHue: '',
  topBarPosition: 'top',
  topBarShown: false,
  navBarTheme: 'main',
  navBarThemeHue: '',
  navBarShown: true,
  navBarPosition: 'left',
  navBarMinimised: false,
  footerShown: false,
  footerTheme: 'mat-black-500-bg',
  footerPosition: 'inline'
};

export const settings: Reducer<Settings> = (state = DEFAULTS, action) => {
  switch (action.type) {
    case StoreActionsEnum.UPDATE_SETTINGS:
      return {
        ...state,
        ...action.payload
      };
    case StoreActionsEnum.UPDATE_SETTING:
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
