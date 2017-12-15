import { Routes, RouterModule, CanActivate, RouterStateSnapshot, ActivatedRouteSnapshot } from '@angular/router';

import { AuthGuard } from './auth.guard';
import { ProjectResolver } from './services/project.resolver';
import { ProjectsResolver } from './services/projects.resolver';

import { DashboardComponent } from './components/dashboard/dashboard.component';
import { ProjectDashboardComponent } from './components/project/project-dashboard/project-dashboard.component';
import { UserManagementComponent } from './components/user-management/user-management.component';
import { NotImplementedComponent } from './components/not-implemented/not-implemented.component';
import { UserProfileComponent } from './components/user-management/user-profile/user-profile.component';
import { ProjectComponent } from './components/project/project.component';
import { ProjectManagementComponent } from './components/project-management/project-management.component';
import { PreviewComponent } from './components/preview/preview.component';
import { UserCrUDComponent } from './components/user-management/user-crud/user-crud.component';
import { WorkflowStatesComponent } from './components/workflow-states/workflow-states.component';
import { EditComponent } from './components/edit/edit.component';

// Not having as a route requires for it to be added as entry component on AppModule
// import {ProjectCrUDComponent} from './components/project-management/project-crud/project-crud.component';

const routes: Routes = [
  {
    path: '',
    resolve: { projects: ProjectsResolver },
    data: { title: 'Crafter Studio' },
    canActivate: [AuthGuard],
    children: [
      {
        path: '',
        component: DashboardComponent
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
        path: 'projects',
        component: ProjectManagementComponent,
        children: [
          {
            path: 'create',
            component: ProjectManagementComponent
          },
          {
            path: ':projectCode',
            component: ProjectManagementComponent
          }
        ]
      },
      {
        path: 'help',
        component: NotImplementedComponent
      },
      {
        path: 'profile',
        component: UserProfileComponent
      },
      {
        path: 'project/:project',
        resolve: { project: ProjectResolver },
        children: [
          {
            path: '',
            component: ProjectComponent
          },
          {
            path: 'dashboard',
            component: ProjectDashboardComponent
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
            component: WorkflowStatesComponent
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
      {
        path: 'preview',
        component: PreviewComponent
      },
      {
        path: 'edit',
        component: EditComponent
      }
    ]
  }
];

export const studioRoutes = RouterModule.forRoot(routes);
