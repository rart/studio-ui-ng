
import {Routes, RouterModule} from '@angular/router';

import {SiteResolver} from './services/site.resolver';

import {DashboardComponent} from './components/dashboard/dashboard.component';
import {SiteDashboardComponent} from './components/site/site-dashboard/site-dashboard.component';
import {UserManagementComponent} from './components/user-management/user-management.component';
import {NotImplementedComponent} from './components/not-implemented/not-implemented.component';
import {UserProfileComponent} from './components/user-management/user-profile/user-profile.component';
import {SiteComponent} from './components/site/site.component';
import {SiteManagementComponent} from './components/site-management/site-management.component';
import {PreviewComponent} from './components/site/preview/preview.component';
import {UserCrUDComponent} from './components/user-management/user-crud/user-crud.component';
// Not having as a route requires for it to be added as entry component on AppModule
// import {SiteCrUDComponent} from './components/site-management/site-crud/site-crud.component';

const routes: Routes = [
  {
    path: '',
    component: DashboardComponent,
    data: { title: 'Crafter Studio' }
  },
  {
    path: 'users',
    component: UserManagementComponent,
    children: [
      {
        path: 'create',
        component: UserCrUDComponent
      },
      {
        path: 'edit/:username',
        component: UserCrUDComponent
      }
    ]
  },
  {
    path: 'sites',
    component: SiteManagementComponent,
    children: [
      {
        path: 'create',
        component: SiteManagementComponent
      },
      {
        path: ':siteCode',
        component: SiteManagementComponent
      }
    ]
  },
  /*{
    path: 'sites/create',
    component: SiteManagementComponent
  },
  {
    path: 'sites/:code',
    component: SiteManagementComponent
  },*/
  {
    path: 'help',
    component: NotImplementedComponent
  },
  {
    path: 'profile',
    component: UserProfileComponent
  },
  {
    path: 'site/:site',
    resolve: { site: SiteResolver },
    children: [
      {
        path: '',
        component: SiteComponent
      },
      {
        path: 'dashboard',
        component: SiteDashboardComponent
      },
      {
        path: 'preview',
        component: PreviewComponent
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
  },
  /*{
    path: 'site/:site/dashboard',
    component: SiteDashboardComponent
  },
  {
    path: 'site/:site/server-log',
    component: NotImplementedComponent
  },*/
];

export const studioRoutes = RouterModule.forRoot(routes);
