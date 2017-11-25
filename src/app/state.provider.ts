import { InjectionToken } from '@angular/core';
import { SubjectStore } from './classes/subject-store.class';

import { StudioHttpService } from './services/http.service';
import { AppState } from '../app/classes/app-state.interface';
import { create, fromState } from '../state/app.store';
import { User } from './models/user.model';

export const appStoreFactory = (http: StudioHttpService): SubjectStore<AppState> => {
  return new SubjectStore(fromState(defaultState));
};

// export const appStoreFactory = (http: StudioHttpService): Store<AppState> => {
//     return fromState(defaultState);
// };

export const AppStore = new InjectionToken('App.store');

export const AppStoreProvider = [
  {
    provide: AppStore,
    useFactory: appStoreFactory,
    deps: [StudioHttpService]
  }
];

const user = User.fromJSON({
  'externally_managed': false,
  'last_name': 'Art',
  'first_name': 'Roy',
  'email': 'royart@me.com',
  'username': 'admin'
});

const defaultState /* : AppState */ = {
  user: user,
  selectedItems: [
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
      children: [
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
          label: 'Thor: Dark World',
          children: null,
          id: '/site/website/movies/thor/index.xml',
          lastEditedOn: '2017-11-01T22:36:33Z',
          url: '/movies/thor',
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
        }
      ],
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
  ],
  expandedPanels: [
    'sidebar.appnav.panel',
    'pending.panel.Pages',
    'pending.panel.Assets',
    'pending.panel.Templates',
    'scheduled.panel.01/31 06:00AM',
    'published.panel.11/13',
    'sidebar.sitenav.pages',
    'sidebar.sitenav.templates',
    'sidebar.sitenav.siteassets'
  ]
};
