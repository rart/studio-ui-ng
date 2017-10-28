
import {Routes, RouterModule} from '@angular/router';
import {DashboardComponent} from './components/dashboard/dashboard.component';
import {SiteDashboardComponent} from './components/site-dashboard/site-dashboard.component';
import {UserManagementComponent} from './components/user-management/user-management.component';
import {NotImplementedComponent} from './components/not-implemented/not-implemented.component';

const routes: Routes = [
  {
    path: '',
    component: DashboardComponent,
    data: { title: 'Crafter Studio' }
  },
  {
    path: 'users',
    component: UserManagementComponent
  },
  {
    path: 'sites',
    component: NotImplementedComponent
  },
  {
    path: 'help',
    component: NotImplementedComponent
  },
  {
    path: 'site/:site',
    component: NotImplementedComponent,
    children: [
      {
        path: 'dashboard',
        component: SiteDashboardComponent
      },
      {
        path: 'server-log',
        component: NotImplementedComponent
      },
      {
        path: 'content-models',
        component: NotImplementedComponent
      },
      {
        path: 'configuration-files',
        component: NotImplementedComponent
      },
      {
        path: 'user-groups',
        component: NotImplementedComponent
      },
      {
        path: 'workflow-states',
        component: NotImplementedComponent
      },
      {
        path: 'bulk-publishing',
        component: NotImplementedComponent
      },
      {
        path: 'audit',
        component: NotImplementedComponent
      },
      {
        path: 'logging-levels',
        component: NotImplementedComponent
      },
      {
        path: 'configuration-files',
        component: NotImplementedComponent
      }
    ]
  }
];

export const studioRoutes = RouterModule.forRoot(routes);
