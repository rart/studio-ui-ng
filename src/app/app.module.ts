import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgModule } from '@angular/core';
import { HTTP_INTERCEPTORS, HttpClient, HttpClientModule, HttpClientXsrfModule } from '@angular/common/http';
import { CdkTableModule } from '@angular/cdk/table';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FlexLayoutModule } from '@angular/flex-layout';
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

// Third party
import { MomentModule } from 'angular2-moment';
import { CookieService } from 'ngx-cookie-service';
import { TreeModule } from 'angular-tree-component';
import { DevToolsExtension, NgRedux, NgReduxModule } from '@angular-redux/store';
import { PERFECT_SCROLLBAR_CONFIG, PerfectScrollbarModule } from 'ngx-perfect-scrollbar';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';

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

// This is just for "pretty" to be available globally, really.
import { global } from './utils/logging.utils';
global();

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
import { PreviewComponent } from './components/preview/preview.component';
import { ProjectManagementComponent } from './components/project-management/project-management.component';
import { PasswordFieldComponent } from './components/user-management/password-field/password-field.component';
import { ContentTreeComponent } from './components/content-tree/content-tree.component';
import { UserCrUDComponent } from './components/user-management/user-crud/user-crud.component';
import { ProjectCrUDComponent } from './components/project-management/project-crud/project-crud.component';
import { ItemListDashletComponent } from './components/project/project-dashboard/item-list-dashlet.component';
import { ChangeLossDecisionViewComponent, EditComponent } from './components/edit/edit.component';
import { EditorComponent } from './components/editor/editor.component';
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
import { ProjectEpics } from './epics/project.epics';
import { ProjectActions } from './actions/project.actions';
import { AuthGuard } from './auth.guard';
import { ProjectsResolver } from './services/projects.resolver';
import { StoreActionsEnum } from './enums/actions.enum';
import { rootReducer } from './reducers/root.reducer';
import { AssetActions } from './actions/asset.actions';
import { PreviewTabsActions } from './actions/preview-tabs.actions';
import { InterceptorEpics } from './epics/interceptor.epics';
import { SyntaxHighlighterComponent } from './components/syntax-highlighter/syntax-highlighter.component';
import { SpinnerComponent } from './components/spinner/spinner.component';
import { AssetEpics } from './epics/asset.epics';
import { PluginHostComponent } from './components/plugin-host/plugin-host.component';
import { SidebarTogglerComponent } from './components/sidebar-toggler/sidebar-toggler.component';
import { AuthInterceptor } from './auth.interceptor';
import { LoginComponent } from './components/login/login.component';
import { UserEpics } from './epics/user.epics';
import { EntryComponent } from './components/entry/entry.component';
import { MainComponent } from './components/main/main.component';
import { TopBarComponent } from './components/topbar/topbar.component';
import { FooterComponent } from './components/footer/footer.component';
import { VerticalNavBarComponent } from './components/vertical-navbar/vertical-navbar.component';
import { HorizontalNavbarComponent } from './components/horizontal-navbar/horizontal-navbar.component';
import { UserMenuComponent } from './components/user-menu/user-menu.component';
import { AssetMenuComponent } from './components/asset-menu/asset-menu.component';
import { AssetOverviewComponent } from './components/asset-review/asset-overview.component';
import { InfoSheetComponent } from './components/asset-info-sheet/info-sheet.component';
import { InfoSheetListComponent } from './components/asset-info-sheet/info-sheet-list.component';
import { DeleteReviewComponent } from './components/asset-review/delete-review.component';
import { ScheduleReviewComponent } from './components/asset-review/schedule-review.component';
import { PublishReviewComponent } from './components/asset-review/publish-review.component';
import { DependencyReviewComponent } from './components/asset-review/dependency-review.component';
import { HistoryReviewComponent } from './components/asset-review/history-review.component';

requirejs({
  baseUrl: `${environment.assetsUrl}/js/vendor`,
  paths: {
    'vs': `${environment.assetsUrl}/js/vendor/vs`,
    'ace': `${environment.assetsUrl}/js/vendor/ace`
  }
});

// AoT requires an exported function for factories
export function HttpLoaderFactory(http: HttpClient) {
  return new TranslateHttpLoader(http, `${environment.url.app}/fixtures/i18n/`);
}

@NgModule({
  declarations: [

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
    AssetDisplayComponent,
    WorkflowStatesComponent,
    IFrameComponent,
    ImageViewerComponent,
    VideoPlayerComponent,
    AudioPlayerComponent,
    FontVisualizerComponent,
    SyntaxHighlighterComponent,
    SpinnerComponent,
    EditComponent,
    EditorComponent,
    CodeEditorComponent,
    ChangeLossDecisionViewComponent,
    PluginHostComponent,
    SidebarTogglerComponent,
    LoginComponent,
    EntryComponent,
    MainComponent,
    TopBarComponent,
    FooterComponent,
    VerticalNavBarComponent,
    HorizontalNavbarComponent,
    UserMenuComponent,
    AssetMenuComponent,
    AssetOverviewComponent,
    InfoSheetComponent,
    InfoSheetListComponent,
    DeleteReviewComponent,
    DependencyReviewComponent,
    HistoryReviewComponent,
    PublishReviewComponent,
    ScheduleReviewComponent

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
    MatProgressSpinnerModule,
    MatRadioModule,
    MatSidenavModule,
    MatIconModule,
    MatToolbarModule,
    MatTooltipModule,
    MatChipsModule,
    MatCardModule,
    MatGridListModule,
    TreeModule,
    MomentModule,
    NgReduxModule,
    HttpClientXsrfModule.withOptions({
      cookieName: environment.auth.cookie,
      headerName: environment.auth.header
    }),
    PerfectScrollbarModule,
    FlexLayoutModule,
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: HttpLoaderFactory,
        deps: [HttpClient]
      }
    })
  ],
  entryComponents: [
    EmbeddedViewDialogComponent,
    ProjectCrUDComponent,
    ItemListDashletComponent,
    ContentTreeComponent,
    ChangeLossDecisionViewComponent,
    PluginHostComponent,
    LoginComponent
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
    InterceptorEpics,
    AssetEpics,
    UserEpics,

    ProjectActions,
    AssetActions,
    PreviewTabsActions,

    AuthGuard,
    ProjectResolver,
    ProjectsResolver,
    { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true },
    { provide: PERFECT_SCROLLBAR_CONFIG, useValue: {  } }

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
