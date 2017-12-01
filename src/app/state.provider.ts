import { InjectionToken } from '@angular/core';
import { SubjectStore } from './classes/subject-store.class';
import { StudioHttpService } from './services/http.service';
import { AppState } from '../app/classes/app-state.interface';
import { appReducer, create, fromState, reducerMap } from './app.store';
import { AVATARS } from '../app/app.utils';
import { StoreActionsEnum } from './enums/actions.enum';
import { combineReducers } from 'redux';

export const appStoreFactory = (http: StudioHttpService): SubjectStore<AppState> => {
  let helper = combineReducers<any>(reducerMap);
  let store = fromState(helper(initialState, { type: StoreActionsEnum.STATE_INIT }));
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

const user = {
  avatarUrl: AVATARS[9],
  username: 'rart',
  email: 'royart@me.com',
  firstName: 'Roy',
  lastName: 'Art',
  managedExternally: false,
  enabled: true,
  sites: null,
  groups: []
};

const selectedItems = [
  {
    lastEditedBy: {
      username: 'admin',
      firstName: 'admin',
      lastName: ''
    },
    lockedBy: {
      username: '',
      firstName: '',
      lastName: ''
    },
    label: 'Player',
    children: null,
    id: '/site/website/player/index.xml',
    lastEditedOn: '2017-10-31T12:54:55Z',
    url: '/player',
    siteCode: 'launcher',
    numOfChildren: 0,
    contentModelId: '/page/player',
    renderingTemplates: [
      {
        uri: '/templates/web/player.ftl',
        name: 'DEFAULT'
      }
    ],
    type: 'PAGE',
    workflowStatus: 'NEW_UNPUBLISHED_LOCKED'
  },
  {
    lastEditedBy: {
      username: 'admin',
      firstName: 'admin',
      lastName: ''
    },
    lockedBy: {
      username: '',
      firstName: '',
      lastName: ''
    },
    label: 'Entertainment',
    children: null,
    id: '/site/website/movies/index.xml',
    lastEditedOn: '2017-11-22T18:38:17Z',
    url: '/movies',
    siteCode: 'launcher',
    numOfChildren: 1,
    contentModelId: '/page/entertainment',
    renderingTemplates: [
      {
        uri: '/templates/web/entertainment.ftl',
        name: 'DEFAULT'
      }
    ],
    type: 'PAGE',
    workflowStatus: 'NEW_UNPUBLISHED_LOCKED'
  },
  {
    lastEditedBy: {
      username: 'admin',
      firstName: 'admin',
      lastName: ''
    },
    lockedBy: {
      username: '',
      firstName: '',
      lastName: ''
    },
    label: 'jquery.js',
    children: null,
    id: '/static-assets/js/jquery.js',
    lastEditedOn: '2017-10-31T12:50:45Z',
    url: '/static-assets/js/jquery.js',
    siteCode: 'launcher',
    numOfChildren: 0,
    contentModelId: null,
    renderingTemplates: [],
    type: 'COMPONENT',
    workflowStatus: 'NEW_SUBMITTED_NO_WF_SCHEDULED_LOCKED'
  }
];

const expandedPanels = [
  'sidebar.appnav.panel',
  'pending.panel.Pages',
  'pending.panel.Assets',
  'pending.panel.Templates',
  'scheduled.panel.01/31 06:00AM',
  'published.panel.11/13',
  'sidebar.sitenav.pages',
  'sidebar.sitenav.templates',
  'sidebar.sitenav.siteassets'
];

const expandedPaths = {
  '/site/website/index.xml': true,
  '/site/website/movies/index.xml': true,
  '/static-assets/css': true
};

const previewTabs = [
  {
    url: '/',
    title: 'Media Launcher',
    siteCode: 'launcher',
    isNew: false
  }
];

const initialState = {
  user: user,
  previewTabs: previewTabs,
  selectedItems: selectedItems,
  expandedPanels: expandedPanels,
  expandedPaths: expandedPaths
};
