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
  MatStepperModule,
  MAT_DATE_LOCALE,
  DateAdapter,
  MAT_DATE_FORMATS
} from '@angular/material';
import { MAT_MOMENT_DATE_FORMATS, MomentDateAdapter } from '@angular/material-moment-adapter';

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
import { ProjectDashboardComponent } from './components/projects/project-dashboard/project-dashboard.component';
import { NotImplementedComponent } from './components/not-implemented/not-implemented.component';
import { UsersComponent } from './components/users/users.component';
import { EmbeddedViewDialogComponent } from './components/embedded-view-dialog/embedded-view-dialog.component';
import { ViewTitleBarComponent } from './components/view-title-bar/view-title-bar.component';
import { UserGroupManagerComponent } from './components/users/user-group-manager/user-group-manager.component';
import { UserProfileComponent } from './components/users/user-profile/user-profile.component';
import { ProjectComponent } from './components/projects/project/project.component';
import { PreviewComponent } from './components/preview/preview.component';
import { ProjectsComponent } from './components/projects/projects.component';
import { PasswordFieldComponent } from './components/users/password-field/password-field.component';
import { ContentTreeComponent } from './components/content-tree/content-tree.component';
import { UserFormComponent } from './components/users/user-form/user-form.component';
import { ProjectCrUDComponent } from './components/projects/project-crud/project-crud.component';
import { ItemListDashletComponent } from './components/projects/project-dashboard/item-list-dashlet.component';
import { ChangeLossDecisionViewComponent, EditComponent } from './components/edit/edit.component';
import { EditorComponent } from './components/editor/editor.component';
import { CodeEditorComponent } from './components/code-editor/code-editor.component';
import { AssetDisplayComponent } from './components/asset-display/asset-display.component';
import { SimpleAssetDisplayComponent } from './components/asset-display/simple-asset-display.component';
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
import { Actions } from './enums/actions.enum';
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
import { UploaderComponent } from './components/uploader/uploader.component';
import { AssetBrowserComponent } from './components/asset-browser/asset-browser.component';
import { CollapsibleComponent } from './components/collapsible/collapsible.component';
import { DirectoryViewComponent } from './components/directory-view/directory-view.component';
import { ProjectsViewComponent } from './components/directory-view/projects-view.component';
import { SearchBarComponent } from './components/search-bar/search-bar.component';
import { GroupsComponent } from './components/groups/groups.component';
import { GroupEpics } from './epics/group.epics';
import { GroupFormComponent } from './components/groups/group-form/group-form.component';
import { UserListComponent } from './components/users/user-list/user-list.component';
import { GroupListComponent } from './components/groups/group-list/group-list.component';
import { FormEditorComponent } from './components/form-editor/form-editor.component';
import { FormEditorContainerComponent } from './components/form-editor/form-editor-container.component';
import { GlobalNavComponent } from './components/global-nav/global-nav.component';
import { ProjectBarComponent } from './components/project-bar/project-bar.component';
import { applyMiddleware } from 'redux';

requirejs({
  baseUrl: `${environment.assetsUrl}/js/vendor`,
  paths: {
    'vs': `${environment.assetsUrl}/js/vendor/vs`,
    'ace': `${environment.assetsUrl}/js/vendor/ace`,
    'plugins': `${environment.assetsUrl}/plugins`
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
    UsersComponent,
    EmbeddedViewDialogComponent,
    ViewTitleBarComponent,
    UserGroupManagerComponent,
    UserProfileComponent,
    ProjectComponent,
    PreviewComponent,
    ProjectsComponent,
    ContentTreeComponent,
    ComponentHostDirective,
    PasswordFieldComponent,
    UserFormComponent,
    ProjectCrUDComponent,
    ItemListDashletComponent,
    AssetDisplayComponent,
    SimpleAssetDisplayComponent,
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
    ScheduleReviewComponent,
    UploaderComponent,
    AssetBrowserComponent,
    CollapsibleComponent,
    DirectoryViewComponent,
    ProjectsViewComponent,
    SearchBarComponent,
    GroupsComponent,
    GroupFormComponent,
    UserListComponent,
    GroupListComponent,
    FormEditorComponent,
    FormEditorContainerComponent,
    GlobalNavComponent,
    ProjectBarComponent
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
    MatTableModule,
    MatDatepickerModule,
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
    LoginComponent,
    UploaderComponent
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
    GroupEpics,

    ProjectActions,
    AssetActions,
    PreviewTabsActions,

    AuthGuard,
    ProjectResolver,
    ProjectsResolver,
    { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true },
    { provide: PERFECT_SCROLLBAR_CONFIG, useValue: {} },

    { provide: MAT_DATE_LOCALE, useValue: 'en' },
    // `MomentDateAdapter` and `MAT_MOMENT_DATE_FORMATS` can be automatically provided by importing
    // `MatMomentDateModule` in your applications root module. We provide it at the component level
    // here, due to limitations of our example generation script.
    { provide: DateAdapter, useClass: MomentDateAdapter, deps: [MAT_DATE_LOCALE] },
    { provide: MAT_DATE_FORMATS, useValue: MAT_MOMENT_DATE_FORMATS }

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

    const epicMiddleware = createEpicMiddleware();

    store.configureStore(
      rootReducer,
      initialState,
      [epicMiddleware],
      enhancers);

    epicMiddleware.run(rootEpic.epic());

    store.dispatch({
      type: Actions.STUDIO_INIT
    });

  }
}
