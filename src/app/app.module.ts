import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule, NoopAnimationsModule } from '@angular/platform-browser/animations';
import { NgModule } from '@angular/core';
import { HTTP_INTERCEPTORS, HttpClientModule, HttpClientXsrfModule } from '@angular/common/http';
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

// Config
import { environment } from '../environments/environment';

// Thid party
import { MomentModule } from 'angular2-moment';
import { CookieService } from 'ngx-cookie-service';
import { TreeModule } from 'angular-tree-component';
import { DevToolsExtension, NgRedux, NgReduxModule } from '@angular-redux/store';

// Studio Services
import { UserService } from './services/user.service';
import { StudioService } from './services/studio.service';
import { ProjectService } from './services/project.service';
import { GroupService } from './services/group.service';
import { CommunicationService } from './services/communication.service';
import { ProjectResolver } from './services/project.resolver';
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
import { ProjectDashboardComponent } from './components/project/project-dashboard/project-dashboard.component';
import { NotImplementedComponent } from './components/not-implemented/not-implemented.component';
import { UserManagementComponent } from './components/user-management/user-management.component';
import { EmbeddedViewDialogComponent } from './components/embedded-view-dialog/embedded-view-dialog.component';
import { ViewTitleBarComponent } from './components/view-title-bar/view-title-bar.component';
import { UserGroupManagerComponent } from './components/user-management/user-group-manager/user-group-manager.component';
import { UserProfileComponent } from './components/user-management/user-profile/user-profile.component';
import { ProjectComponent } from './components/project/project.component';
import { PreviewComponent } from './components/project/preview/preview.component';
import { ProjectManagementComponent } from './components/project-management/project-management.component';
import { PasswordFieldComponent } from './components/user-management/password-field/password-field.component';
import { ContentTreeComponent } from './components/project/content-tree/content-tree.component';
import { UserCrUDComponent } from './components/user-management/user-crud/user-crud.component';
import { ProjectCrUDComponent } from './components/project-management/project-crud/project-crud.component';
import { ItemListDashletComponent } from './components/project/project-dashboard/item-list-dashlet.component';
import { I18nPipe } from './i18n.pipe';
import { CodeEditorComponent } from './components/code-editor/code-editor.component';
import { AssetDisplayComponent } from './components/asset-display/asset-display.component';
import { WorkflowStatesComponent } from './components/workflow-states/workflow-states.component';
import { FilterWithPipe } from './filter-with.pipe';
import { IFrameComponent } from './components/iframe/iframe.component';
import { ImageViewerComponent } from './components/image-viewer/image-viewer.component';
import { VideoPlayerComponent } from './components/video-player/video-player.component';
import { AudioPlayerComponent } from './components/audio-player/audio-player.component';
import { FontVisualizerComponent } from './components/font-visualizer/font-visualizer.component';
import { AppState } from './classes/app-state.interface';
import { initialState } from './utils/initial-state.utils';
import { createEpicMiddleware } from 'redux-observable';
import { RootEpic } from './epics/root.epic';
import { ProjectEpics } from './epics/project.epic';
import { ProjectActions } from './actions/project.actions';
import { AuthGuard } from './auth.guard';
import { ProjectsResolver } from './services/projects.resolver';
import { StoreActionsEnum } from './enums/actions.enum';
import { rootReducer } from './reducers/root.reducer';
import { AssetActions } from './actions/asset.actions';
import { PreviewTabsActions } from './actions/preview-tabs.actions';
import { InterceptorEpic } from './epics/interceptor.epic';
import { TabBarComponent } from './components/tab-bar/tab-bar.component';
import { SyntaxHighlighterComponent } from './components/syntax-highlighter/syntax-highlighter.component';
import { SpinnerComponent } from './components/spinner/spinner.component';

import { pretty } from './utils/logging.utils';
pretty('GREEN', 'Studio Initializing...'); // This is just for pretty to be available globally, really.

requirejs({
  baseUrl: `${environment.assetsUrl}/js/vendor`,
  paths: {
    'vs': `${environment.assetsUrl}/js/vendor/vs`,
    'ace': `${environment.assetsUrl}/js/vendor/ace`
  }
});

@NgModule({
  declarations: [

    I18nPipe,
    SafeUrlPipe,
    FilterWithPipe,

    AppComponent,
    SidebarComponent,
    DashboardComponent,
    ProjectDashboardComponent,
    NotImplementedComponent,
    UserManagementComponent,
    EmbeddedViewDialogComponent,
    ViewTitleBarComponent,
    UserGroupManagerComponent,
    UserProfileComponent,
    ProjectComponent,
    PreviewComponent,
    ProjectManagementComponent,
    ContentTreeComponent,
    ComponentHostDirective,
    PasswordFieldComponent,
    UserCrUDComponent,
    ProjectCrUDComponent,
    ItemListDashletComponent,
    CodeEditorComponent,
    AssetDisplayComponent,
    WorkflowStatesComponent,
    IFrameComponent,
    ImageViewerComponent,
    VideoPlayerComponent,
    AudioPlayerComponent,
    FontVisualizerComponent,
    TabBarComponent,
    SyntaxHighlighterComponent,
    SpinnerComponent
  ],
  imports: [
    studioRoutes,
    HttpClientModule,
    BrowserModule,
    // NoopAnimationsModule,
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
    MomentModule,
    NgReduxModule,
    HttpClientXsrfModule.withOptions({
      cookieName: environment.auth.cookie,
      headerName: environment.auth.header
    })
  ],
  entryComponents: [
    EmbeddedViewDialogComponent,
    ProjectCrUDComponent,
    ItemListDashletComponent,
    ContentTreeComponent
  ],
  providers: [

    StudioService,
    UserService,
    ProjectService,
    GroupService,
    CommunicationService,
    StudioHttpService,
    ContentService,
    WorkflowService,
    CookieService,

    RootEpic,
    ProjectEpics,
    InterceptorEpic,

    ProjectActions,
    AssetActions,
    PreviewTabsActions,

    AuthGuard,
    ProjectResolver,
    ProjectsResolver

  ],
  bootstrap: [AppComponent]
})
export class AppModule {
  constructor(private store: NgRedux<AppState>,
              private rootEpic: RootEpic,
              private devTools: DevToolsExtension) {

    let enhancers = [];

    if (!environment.production && devTools.isEnabled()) {
      enhancers.push(devTools.enhancer());
    }

    store.configureStore(
      rootReducer,
      initialState,
      [createEpicMiddleware(rootEpic.epic())],
      enhancers);

    store.dispatch({
      type: StoreActionsEnum.STUDIO_INIT
    });

  }
}
