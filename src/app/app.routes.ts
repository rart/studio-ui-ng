import { Routes, RouterModule } from '@angular/router';

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
import { EntryComponent } from './components/entry/entry.component';
import { AssetOverviewComponent } from './components/asset-review/asset-overview.component';
import { InfoSheetListComponent } from './components/asset-info-sheet/info-sheet-list.component';
import { DeleteReviewComponent } from './components/asset-review/delete-review.component';
import { HistoryReviewComponent } from './components/asset-review/history-review.component';
import { PublishReviewComponent } from './components/asset-review/publish-review.component';
import { ScheduleReviewComponent } from './components/asset-review/schedule-review.component';
import { DependencyReviewComponent } from './components/asset-review/dependency-review.component';
import { AssetBrowserComponent } from './components/asset-browser/asset-browser.component';

// Not having as a route requires for it to be added as entry component on AppModule
// import {ProjectCrUDComponent} from './components/project-management/project-crud/project-crud.component';

export const routes: Routes = [
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
        path: 'login',
        component: EntryComponent
      },
      {
        path: 'users',
        component: UserManagementComponent
      },
      {
        path: 'assets',
        component: AssetBrowserComponent,
      },
      {
        path: 'users/create',
        component: UserCrUDComponent
      },
      {
        path: 'users/edit/:username',
        component: UserCrUDComponent
      },
      {
        path: 'organizations',
        component: NotImplementedComponent
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
        path: 'config',
        component: NotImplementedComponent
      },
      {
        path: 'help',
        component: NotImplementedComponent
      },
      {
        path: 'market',
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
            path: 'review',
            children: [
              {
                path: '',
                pathMatch: 'full',
                redirectTo: 'selected/info'
              },
              {
                path: ':asset',
                component: AssetOverviewComponent,
                children: [
                  {
                    path: 'info',
                    data: { label: 'Info' },
                    component: InfoSheetListComponent
                  },
                  {
                    path: 'delete',
                    data: { label: 'Delete' },
                    component: DeleteReviewComponent
                  },
                  {
                    path: 'history',
                    data: { label: 'History' },
                    component: HistoryReviewComponent
                  },
                  {
                    path: 'publish',
                    data: { label: 'Publish' },
                    component: PublishReviewComponent
                  },
                  {
                    path: 'schedule',
                    data: { label: 'Schedule' },
                    component: ScheduleReviewComponent
                  },
                  {
                    path: 'dependencies',
                    data: { label: 'Dependencies' },
                    component: DependencyReviewComponent
                  }
                ]
              }
            ]
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
