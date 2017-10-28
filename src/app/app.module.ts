import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgModule } from '@angular/core';
import { HttpModule } from '@angular/http';
import {CdkTableModule} from '@angular/cdk/table';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {
  MatAutocompleteModule,
  MatButtonModule,
  MatButtonToggleModule,
  MatCardModule,
  MatCheckboxModule,
  MatChipsModule,
  MatDatepickerModule,
  MatDialogModule,
  MatExpansionModule,
  MatGridListModule,
  MatIconModule,
  MatInputModule,
  MatListModule,
  MatMenuModule,
  MatNativeDateModule,
  MatPaginatorModule,
  MatProgressBarModule,
  MatProgressSpinnerModule,
  MatRadioModule,
  MatRippleModule,
  MatSelectModule,
  MatSidenavModule,
  MatSliderModule,
  MatSlideToggleModule,
  MatSnackBarModule,
  MatSortModule,
  MatTableModule,
  MatTabsModule,
  MatToolbarModule,
  MatTooltipModule,
  MatStepperModule,
} from '@angular/material';


import { UserService } from './services/user.service';
import { StudioService } from './services/studio.service';
import { SiteService } from './services/site.service';
import { GroupService } from './services/group.service';

import { studioRoutes } from './app.routes';
import { AppComponent } from './app.component';
import { SidebarComponent } from './components/sidebar/sidebar.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { SiteDashboardComponent } from './components/site-dashboard/site-dashboard.component';
import { NotImplementedComponent } from './components/not-implemented/not-implemented.component';
import { UserManagementComponent } from './components/user-management/user-management.component';
import { UserManagementDialogComponent } from './components/user-management/user-management-dialog/user-management-dialog.component';
import { ViewTitleBarComponent } from './components/view-title-bar/view-title-bar.component';
import { UserGroupManagerComponent } from './components/user-management/user-group-manager/user-group-manager.component';

@NgModule({
  declarations: [
    AppComponent,
    SidebarComponent,
    DashboardComponent,
    SiteDashboardComponent,
    NotImplementedComponent,
    UserManagementComponent,
    UserManagementDialogComponent,
    ViewTitleBarComponent,
    UserGroupManagerComponent
  ],
  imports: [
    studioRoutes,
    HttpModule,
    BrowserModule,
    BrowserAnimationsModule,
    FormsModule,
    CdkTableModule,
    MatExpansionModule,
    MatCheckboxModule,
    MatPaginatorModule,
    MatDialogModule,
    MatInputModule,
    ReactiveFormsModule,
    MatTabsModule,
    MatButtonModule,
    MatMenuModule,
    MatSnackBarModule
  ],
  entryComponents: [UserManagementDialogComponent],
  providers: [
    StudioService,
    UserService,
    SiteService,
    GroupService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
