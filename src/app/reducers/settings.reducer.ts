import { Reducer } from 'redux';
import { Settings } from '../classes/app-state.interface';
import { StoreActionsEnum } from '../enums/actions.enum';

export const settings: Reducer<Settings> = (state = {
  'meta.click.open.tab.in.background': true
}, action) => {
  switch (action.type) {
    case StoreActionsEnum.UPDATE_GLOBAL_SETTINGS:
      return {
        ...state,
        [action.payload.key]: action.payload.value
      }
    default:
      return state;
  }
};
