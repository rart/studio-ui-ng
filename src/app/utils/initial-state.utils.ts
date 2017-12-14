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
        activeId: 'DEFAULT_TAB_ID',
        order: ['DEFAULT_TAB_ID'],
        byId: {
          'DEFAULT_TAB_ID': {
            id: 'DEFAULT_TAB_ID',
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
        'sidebar.projectnav.pages': true,
        'sidebar.projectnav.projectassets': true,
        'sidebar.appnav.panel': true,
        'pending.panel.assets': true,
        'pending.panel.templates': true
      },
      expandedPaths: {
        '/site/website/index.xml': true,
        '/static-assets/js': true
      }
    }
  }
};
