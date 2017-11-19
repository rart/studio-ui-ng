import {InjectionToken} from '@angular/core';
import {Store} from 'redux';

// import {Store} from './classes/store.class';
import {StudioHttpService} from './services/http.service';
import {AppState} from '../app/classes/app-state.interface';
import {create, fromState} from '../state/app.store';
import {ActionTypesList} from '../state/actions.enum';

const EXPAND_PANEL = ActionTypesList.EXPAND_PANEL;

export const appStoreFactory = (http: StudioHttpService): Store<AppState> => {

  // let store = fromState({
  //   selectedItems: [],
  //   expandedPanels: []
  // });
  //
  // let keys = Object.keys(ActionTypesList);
  // console.log('Enum keys: ', keys);
  //
  // let map = new Map<ActionTypesList, keyof AppState>();
  // map[ActionTypesList.EXPAND_PANEL] = 'expandedPanels';
  // map[ActionTypesList.SELECT_ITEM] = 'selectedItems';
  //
  // return new Store(store, map);

  return fromState({
    selectedItems: [],
    expandedPanels: []
  });

};

export const AppStore = new InjectionToken('App.store');

export const AppStoreProvider = [
  {
    provide: AppStore,
    useFactory: appStoreFactory,
    deps: [StudioHttpService]
  }
];
