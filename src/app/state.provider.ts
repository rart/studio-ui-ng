import { InjectionToken } from '@angular/core';
import { SubjectStore } from './classes/subject-store.class';
import { StudioHttpService } from './services/http.service';
import { AppState } from '../app/classes/app-state.interface';
import { fromState} from './app.store';
import { StoreActionsEnum } from './enums/actions.enum';
import { combineReducers } from 'redux';
import { initialState } from './utils/initial-state.utils';
import { reducerMap } from './reducers/root.reducer';

export const appStoreFactory = (http: StudioHttpService): SubjectStore<AppState> => {
  let helper = combineReducers<any>(reducerMap);
  let store = fromState(helper(initialState, { type: StoreActionsEnum.STUDIO_INIT }));
  return new SubjectStore(store);
};

// export const appStoreFactory = (http: StudioHttpService): Store<AppState> => {
//     return fromState(initialState);
// };

export const AppStore = new InjectionToken('App.store');

export const AppStoreProvider = [
  {
    provide: AppStore,
    useFactory: appStoreFactory,
    deps: [StudioHttpService]
  }
];
