import { AppState } from '../classes/app-state.interface';
import { AVATARS } from '../app.utils';

export const initialState: AppState = {
  explorer: undefined,
  activeProjectCode: 'editorial',
  auth: 'validated',
  user: {
    avatarUrl: AVATARS[9],
    username: 'admin',
    email: 'roy.art@craftersoftware.com',
    firstName: 'Roy',
    lastName: 'Art',
    externallyManaged: false,
    enabled: true,
    projects: null,
    groups: []
  },
  previewTabs: undefined,
  workspaces: {
    'editorial': {
      previewTabs: {
        activeId: 'TEST_TAB_ID',
        order: ['TEST_TAB_ID'],
        byId: {
          'TEST_TAB_ID': {
            id: 'TEST_TAB_ID',
            url: '/',
            title: 'Media Launcher',
            projectCode: 'launcher',
            assetId: '/site/website/index.xml',
            pending: true,
            history: null
          }
        }
      },
      selectedItems: {
        'editorial:/site/website/index.xml': true
      },
      expandedPanels: {
        'pending.panel.pages': true,
        'sidebar.projectnav.pages': true,
        'sidebar.projectnav.assets': true,
        'sidebar.appnav.panel': true,
        'pending.panel.assets': true,
        'pending.panel.templates': true
      },
      expandedPaths: {
        '/site/website/index.xml': true,
        '/static-assets/js': true
      }
    }
  },
  editSessions: {
    activeId: 'TEST_SESSION_ID_3',
    order: ['TEST_SESSION_ID_3', 'TEST_SESSION_ID_5'],
    byId: {
      'TEST_SESSION_ID_3': {
        id: 'TEST_SESSION_ID_3',
        status: 'void',
        data: null,
        assetId: 'editorial:/site/website/index.xml',
        projectCode: 'editorial',
        fetchPayload: null
      },
      'TEST_SESSION_ID_5': {
        id: 'TEST_SESSION_ID_5',
        status: 'void',
        data: {  },
        assetId: 'editorial:/static-assets/js/main.js',
        projectCode: 'editorial',
        fetchPayload: null
      }
    }
  },
  usersList: undefined,
  groupsList: undefined,
};
