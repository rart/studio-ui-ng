import { AppState } from '../classes/app-state.interface';
import { AVATARS } from '../app.utils';

export const initialState: AppState = {
  activeProjectCode: 'launcher',
  auth: 'validated',
  user: {
    avatarUrl: AVATARS[9],
    username: 'admin',
    email: 'roy.art@craftersoftware.com',
    firstName: 'Roy',
    lastName: 'Art',
    managedExternally: false,
    enabled: true,
    projects: null,
    groups: []
  },
  previewTabs: undefined,
  workspaces: {
    'launcher': {
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
        'launcher:/site/website/index.xml': true,
        'launcher:/site/website/movies/index.xml': true
      },
      expandedPanels: {
        'pending.panel.pages': true,
        'scheduled.panel.02/16 02:30am': true,
        'sidebar.projectnav.pages': true,
        // 'sidebar.projectnav.assets': true,
        'sidebar.appnav.panel': true,
        'pending.panel.assets': true,
        'pending.panel.templates': true
      },
      expandedPaths: {
        '/site/website/index.xml': true,
        // '/static-assets/js': true
      }
    },
    'business-casual': {
      previewTabs: undefined,
      selectedItems: undefined,
      expandedPanels: {
        'pending.panel.pages': true,
        'sidebar.projectnav.assets': true,
        'sidebar.appnav.panel': true
      },
      expandedPaths: undefined
    },
    'craftersoftwarecom': {
      previewTabs: undefined,
      selectedItems: undefined,
      expandedPanels: {
        'pending.panel.pages': true,
        'sidebar.projectnav.assets': true,
        'sidebar.appnav.panel': true
      },
      expandedPaths: undefined
    },
    'iot': {
      previewTabs: undefined,
      selectedItems: undefined,
      expandedPanels: {
        'pending.panel.pages': true,
        'sidebar.projectnav.assets': true,
        'sidebar.appnav.panel': true
      },
      expandedPaths: undefined
    },
    'sumer': {
      previewTabs: undefined,
      selectedItems: undefined,
      expandedPanels: {
        'pending.panel.pages': true,
        'sidebar.projectnav.assets': true,
        'sidebar.appnav.panel': true
      },
      expandedPaths: undefined
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
        assetId: 'launcher:/site/website/index.xml',
        projectCode: 'launcher',
        fetchPayload: null
      },
      'TEST_SESSION_ID_5': {
        id: 'TEST_SESSION_ID_5',
        status: 'void',
        data: { split: 'vertical' },
        assetId: 'launcher:/static-assets/js/main.js',
        projectCode: 'launcher',
        fetchPayload: null
      }
    }
  }
};
