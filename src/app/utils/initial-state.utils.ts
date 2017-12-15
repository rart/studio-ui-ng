import { AppState } from '../classes/app-state.interface';
import { AVATARS } from '../app.utils';

export const initialState: AppState = {
  activeProjectCode: 'launcher',
  user: {
    avatarUrl: AVATARS[9],
    username: 'admin',
    email: 'royart@me.com',
    firstName: 'Roy',
    lastName: 'Art',
    managedExternally: false,
    enabled: true,
    projects: null,
    groups: []
  },
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
        '/site/website/index.xml': true
      },
      expandedPanels: {
        'pending.panel.pages': true,
        'scheduled.panel.02/16 02:30am': true,
        // 'sidebar.projectnav.pages': true,
        'sidebar.projectnav.assets': true,
        'sidebar.appnav.panel': true,
        'pending.panel.assets': true,
        'pending.panel.templates': true
      },
      expandedPaths: {
        // '/site/website/index.xml': true,
        // '/static-assets/js': true
      }
    }
  },
  editSessions: {
    activeId: 'TEST_SESSION_ID_2',
    order: ['TEST_SESSION_ID_2', 'TEST_SESSION_ID_4', /*'TEST_SESSION_ID_1', */'TEST_SESSION_ID_3'],
    byId: {
      // 'TEST_SESSION_ID_1': {
      //   id: 'TEST_SESSION_ID_1',
      //   status: 'void',
      //   data: null,
      //   assetId: '/static-assets/js/jquery.js',
      //   projectCode: 'launcher',
      //   fetchPayload: null
      // },
      'TEST_SESSION_ID_2': {
        id: 'TEST_SESSION_ID_2',
        status: 'void',
        data: null,
        assetId: '/templates/web/index.ftl',
        projectCode: 'launcher',
        fetchPayload: null
      },
      'TEST_SESSION_ID_3': {
        id: 'TEST_SESSION_ID_3',
        status: 'void',
        data: null,
        assetId: '/static-assets/js/crafter-support-1-0-0.js',
        projectCode: 'launcher',
        fetchPayload: null
      },
      'TEST_SESSION_ID_4': {
        id: 'TEST_SESSION_ID_4',
        status: 'void',
        data: null,
        assetId: '/static-assets/js/foo.js',
        projectCode: 'launcher',
        fetchPayload: null
      }
    }
  }
};
