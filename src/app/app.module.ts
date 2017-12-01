import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule, NoopAnimationsModule } from '@angular/platform-browser/animations';
import { NgModule } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { CdkTableModule } from '@angular/cdk/table';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
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

// Thid party
import { MomentModule } from 'angular2-moment';
import { CookieService } from 'ngx-cookie-service';
import { TreeModule } from 'angular-tree-component';

// Studio Services
import { UserService } from './services/user.service';
import { StudioService } from './services/studio.service';
import { SiteService } from './services/site.service';
import { GroupService } from './services/group.service';
import { CommunicationService } from './services/communication.service';
import { SiteResolver } from './services/site.resolver';
import { StudioHttpService } from './services/http.service';
import { ContentService } from './services/content.service';
import { WorkflowService } from './services/workflow.service';

import { studioRoutes } from './app.routes';
import { SafeUrlPipe } from './safe-url.pipe';
import { ComponentHostDirective } from './components/component-host.directive';

// Studio Components
import { AppComponent } from './app.component';
import { SidebarComponent } from './components/sidebar/sidebar.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { SiteDashboardComponent } from './components/site/site-dashboard/site-dashboard.component';
import { NotImplementedComponent } from './components/not-implemented/not-implemented.component';
import { UserManagementComponent } from './components/user-management/user-management.component';
import { EmbeddedViewDialogComponent } from './components/embedded-view-dialog/embedded-view-dialog.component';
import { ViewTitleBarComponent } from './components/view-title-bar/view-title-bar.component';
import { UserGroupManagerComponent } from './components/user-management/user-group-manager/user-group-manager.component';
import { UserProfileComponent } from './components/user-management/user-profile/user-profile.component';
import { SiteComponent } from './components/site/site.component';
import { PreviewComponent } from './components/site/preview/preview.component';
import { SiteManagementComponent } from './components/site-management/site-management.component';
import { PasswordFieldComponent } from './components/user-management/password-field/password-field.component';
import { ContentTreeComponent } from './components/site/content-tree/content-tree.component';
import { UserCrUDComponent } from './components/user-management/user-crud/user-crud.component';
import { SiteCrUDComponent } from './components/site-management/site-crud/site-crud.component';
import { ItemListDashletComponent } from './components/site/site-dashboard/item-list-dashlet.component';
import { I18nPipe } from './i18n.pipe';
import { CodeEditorComponent } from './components/code-editor/code-editor.component';
import { AppStoreProvider } from './state.provider';
import { AssetDisplayComponent } from './components/asset-display/asset-display.component';
import { WorkflowStatesComponent } from './components/workflow-states/workflow-states.component';
import { FilterWithPipe } from './filter-with.pipe';
import { IFrameComponent } from './components/iframe/iframe.component';
import { ImageViewerComponent } from './components/image-viewer/image-viewer.component';
import { VideoPlayerComponent } from './components/video-player/video-player.component';
import { AudioPlayerComponent } from './components/audio-player/audio-player.component';
import { FontVisualizerComponent } from './components/font-visualizer/font-visualizer.component';

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
    SiteCrUDComponent,
    ItemListDashletComponent,
    I18nPipe,
    CodeEditorComponent,
    AssetDisplayComponent,
    WorkflowStatesComponent,
    FilterWithPipe,
    IFrameComponent,
    ImageViewerComponent,
    VideoPlayerComponent,
    AudioPlayerComponent,
    FontVisualizerComponent
  ],
  imports: [
    studioRoutes,
    HttpClientModule,
    BrowserModule,
    // NoopAnimationsModule, // TODO: BrowserAnimationsModule
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
    MatProgressSpinnerModule,
    MatRadioModule,
    TreeModule,
    MomentModule
  ],
  entryComponents: [
    EmbeddedViewDialogComponent,
    SiteCrUDComponent,
    ItemListDashletComponent,

    ContentTreeComponent
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
    CookieService,
    WorkflowService,
    AppStoreProvider
  ],
  bootstrap: [AppComponent]
})
export class AppModule {
}
