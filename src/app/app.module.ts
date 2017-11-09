import {BrowserModule} from '@angular/platform-browser';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {NgModule} from '@angular/core';
import {HttpClientModule} from '@angular/common/http';
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
  MatStepperModule
} from '@angular/material';

import {UserService} from './services/user.service';
import {StudioService} from './services/studio.service';
import {SiteService} from './services/site.service';
import {GroupService} from './services/group.service';
import {CommunicationService} from './services/communication.service';
import {SiteResolver} from './services/site.resolver';
import {CookieService} from 'ngx-cookie-service';
import {StudioHttpService} from './services/http.service';
import {ContentService} from './services/content.service';

import {studioRoutes} from './app.routes';
import {AppComponent} from './app.component';
import {SidebarComponent} from './components/sidebar/sidebar.component';
import {DashboardComponent} from './components/dashboard/dashboard.component';
import {SiteDashboardComponent} from './components/site/site-dashboard/site-dashboard.component';
import {NotImplementedComponent} from './components/not-implemented/not-implemented.component';
import {UserManagementComponent} from './components/user-management/user-management.component';
import {EmbeddedViewDialogComponent} from './components/embedded-view-dialog/embedded-view-dialog.component';
import {ViewTitleBarComponent} from './components/view-title-bar/view-title-bar.component';
import {UserGroupManagerComponent} from './components/user-management/user-group-manager/user-group-manager.component';
import {UserProfileComponent} from './components/user-management/user-profile/user-profile.component';
import {SiteComponent} from './components/site/site.component';
import {PreviewComponent} from './components/site/preview/preview.component';
import {SiteManagementComponent} from './components/site-management/site-management.component';
import {PasswordFieldComponent} from './components/user-management/password-field/password-field.component';
import {SafeUrlPipe} from './safe-url.pipe';

import {ContentTreeComponent} from './components/site/content-tree/content-tree.component';
import {ComponentHostDirective} from './components/component-host.directive';
import {UserCrUDComponent} from './components/user-management/user-crud/user-crud.component';
import {TreeModule} from 'angular-tree-component';
import {SiteCrUDComponent} from './components/site-management/site-crud/site-crud.component';

@NgModule({
  declarations: [
    SafeUrlPipe,
    AppComponent,
    SidebarComponent,
    DashboardComponent,
    SiteDashboardComponent,
    NotImplementedComponent,
    UserManagementComponent,
    EmbeddedViewDialogComponent,
    ViewTitleBarComponent,
    UserGroupManagerComponent,
    UserProfileComponent,
    SiteComponent,
    PreviewComponent,
    SiteManagementComponent,
    ContentTreeComponent,
    ComponentHostDirective,
    PasswordFieldComponent,
    UserCrUDComponent,
    SiteCrUDComponent
  ],
  imports: [
    studioRoutes,
    HttpClientModule,
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
    MatSnackBarModule,
    MatSelectModule,
    TreeModule
  ],
  entryComponents: [
    EmbeddedViewDialogComponent,
    SiteCrUDComponent
  ],
  providers: [
    StudioService,
    UserService,
    SiteService,
    GroupService,
    CommunicationService,
    SiteResolver,
    StudioHttpService,
    ContentService,
    CookieService
  ],
  bootstrap: [AppComponent]
})
export class AppModule {
}
