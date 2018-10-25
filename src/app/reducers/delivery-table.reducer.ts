import { AnyAction, Reducer } from 'redux';
import { isNullOrUndefined } from 'util';
import { Actions } from '../enums/actions.enum';

export const deliveryTable: Reducer<{ [key: string]: any }> = (state = {}, action: AnyAction) => {
  if (isNullOrUndefined(action.spaceUID)) {
    return state;
  } else {
    if (isNullOrUndefined(state[action.spaceUID]) || !action.isResponse) {
      return { ...state, [action.spaceUID]: '@@PENDING' };
    } else {
      switch (action.type) {
        case Actions.FETCH_SOME_ASSETS: {
          let assets = action.resultSelector ? action.resultSelector(action.payload) : action.payload;
          return { ...state, [action.spaceUID]: assets };
        }
        default:
          return { ...state, [action.spaceUID]: action.payload };
      }

    }
  }
};
