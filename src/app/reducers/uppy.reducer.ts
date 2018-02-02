import { AnyAction, Reducer } from 'redux';

export const uppy: Reducer<any> = (state = {}, action: AnyAction) => {
  if (action.type === 'UPPY_STATE_UPDATE') {
    return {
      ...state,
      ...action.patch
    };
  } else {
    return state;
  }
};
