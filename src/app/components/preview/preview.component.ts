import {
  AfterViewInit,
  Component,
  ElementRef, HostBinding,
  OnDestroy,
  OnInit,
  QueryList,
  ViewChild,
  ViewChildren
} from '@angular/core';
import { MatSnackBar } from '@angular/material';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable ,  Subject } from 'rxjs';
import { filter, map, switchMap, take, takeUntil } from 'rxjs/operators';
import { dispatch, NgRedux } from '@angular-redux/store';
import { CookieService } from 'ngx-cookie-service';

import { WithNgRedux } from '../../classes/with-ng-redux.class';
import { ProjectService } from '../../services/project.service';
import { Project } from '../../models/project.model';
import { CommunicationService } from '../../services/communication.service';
import { WindowMessageScopeEnum } from '../../enums/window-message-scope.enum';
import { Asset } from '../../models/asset.model';
import { WindowMessageTopicEnum } from '../../enums/window-message-topic.enum';
import { AppState, LookupTable, PreviewTab, PreviewTabStateContainer } from '../../classes/app-state.interface';
import { IFrameComponent } from '../iframe/iframe.component';
import { PreviewTabsActions } from '../../actions/preview-tabs.actions';
import { StringUtils } from '../../utils/string.utils';
import { createPreviewTabCore } from '../../utils/state.utils';
import { AssetTypeEnum } from '../../enums/asset-type.enum';
import { VideoPlayerComponent } from '../video-player/video-player.component';
import { AudioPlayerComponent } from '../audio-player/audio-player.component';
import { FontVisualizerComponent } from '../font-visualizer/font-visualizer.component';
import { ImageViewerComponent } from '../image-viewer/image-viewer.component';
import { isNullOrUndefined } from 'util';
import { showSnackBar } from '../../utils/material.utils';
import { environment } from '../../../environments/environment';
import { notNullOrUndefined } from '../../app.utils';

// import { trigger, style, transition, animate, keyframes, query, stagger } from '@angular/animations';
// https://angular.io/guide/animations

const clearTimeout = window.clearTimeout;

const COOKIE = environment.preview.cookie;
const LANDING_PAGE_TITLE = '** Crafter Studio Preview **';
const ERROR_PAGE_TITLE = '** Crafter Studio Preview ERROR **';
const IFRAME_LANDING_URL = '/assets/guest.landing.html';
const IFRAME_ERROR_URL = '/assets/guest.500.html';
const IFRAME_LOAD_CONTROL_TIMEOUT = 5000;
const PROJECT_HOME_PAGE = '/';

const isExternalURL = (url) => {
  return (StringUtils.startsWith(url, 'http') || StringUtils.startsWith(url, '//'));
};

// Studio Form Engine URLs are like...
// /studio/form?
//  form=/page/entry&
//  path=/site/website/index.xml&
//  iceComponent=true&
//  site=launcher&
//  edit=true&
//  editorId=b0665d96-2395-14b5-7f2b-3db8fa7286e3

// tslint:disable-next-line:max-line-length
// /studio/form?form=/page/entry&path=/site/website/index.xml&iceComponent=true&site=launcher&edit=true&editorId=b0665d96-2395-14b5-7f2b-3db8fa7286e3
// https://angular.io/guide/router#router-events

// CStudioAuthoring.Operations.editContent(
//   content.form,
//   CStudioAuthoringContext.siteId,
//   content.uri,
//   content.nodeRef,
//   content.uri,
//   false,
//   editCallback);

const FileAssociations = {

  [AssetTypeEnum.CSS]: 'SyntaxHighlighterComponent',
  [AssetTypeEnum.SCSS]: 'SyntaxHighlighterComponent',
  [AssetTypeEnum.SASS]: 'SyntaxHighlighterComponent',
  [AssetTypeEnum.LESS]: 'SyntaxHighlighterComponent',
  [AssetTypeEnum.GROOVY]: 'SyntaxHighlighterComponent',
  [AssetTypeEnum.JAVASCRIPT]: 'SyntaxHighlighterComponent',
  [AssetTypeEnum.FREEMARKER]: 'SyntaxHighlighterComponent',

  [AssetTypeEnum.MP4]: 'VideoPlayerComponent',

  [AssetTypeEnum.MPEG]: 'AudioPlayerComponent',

  [AssetTypeEnum.TTF_FONT]: 'FontVisualizerComponent',
  [AssetTypeEnum.OTF_FONT]: 'FontVisualizerComponent',
  [AssetTypeEnum.EOT_FONT]: 'FontVisualizerComponent',
  [AssetTypeEnum.WOFF_FONT]: 'FontVisualizerComponent',
  [AssetTypeEnum.WOFF2_FONT]: 'FontVisualizerComponent',

  [AssetTypeEnum.GIF]: 'ImageViewerComponent',
  [AssetTypeEnum.PNG]: 'ImageViewerComponent',
  [AssetTypeEnum.SVG]: 'ImageViewerComponent',
  [AssetTypeEnum.JPEG]: 'ImageViewerComponent',

  [AssetTypeEnum.PAGE]: 'iFrameComponent',
  [AssetTypeEnum.HTML]: 'iFrameComponent'

};

@Component({
  selector: 'std-preview',
  templateUrl: './preview.component.html',
  styleUrls: ['./preview.component.scss']
})
export class PreviewComponent extends WithNgRedux implements OnInit, AfterViewInit, OnDestroy {

  @HostBinding('class.tabbed')
  get hasTabs() {
    return this.tabs ? (this.tabs.length > 1) : false;
  }

  @ViewChildren('urlBox') input: QueryList<ElementRef>;
  @ViewChild(IFrameComponent) iFrameComponent: IFrameComponent;

  projects$: Observable<Project[]>;

  previewTabs$: Observable<PreviewTabStateContainer>;

  project: Project;
  projects: Array<Project>;
  assets: LookupTable<Asset> = {};

  tabs: PreviewTab[];
  activeTab: PreviewTab;
  activeTabType;
  activeTabAsset;

  iFrameLandingUrl = IFRAME_LANDING_URL;
  guestLoadControlTimeout = null;

  previewTabsObserver$ = new Subject<string>();

  checkIn$ = new Subject();

  // assetRenderComponent

  get urlBox() {
    try {
      return this.input.first.nativeElement;
    } catch (e) {
      pretty('RED', 'PreviewComponent: URL input was read but was not found. Returned "fake" input.');
      return document.createElement('input');
    }
  }

  constructor(store: NgRedux<AppState>,
              private router: Router,
              private route: ActivatedRoute,
              private projectService: ProjectService,
              private cookieService: CookieService,
              private communicator: CommunicationService,
              private snackBar: MatSnackBar,
              private previewTabActions: PreviewTabsActions) {
    super(store);
  }

  ngOnInit() {

    this.addTearDown(() => clearTimeout(this.guestLoadControlTimeout));

    // TODO: check why map is before filter
    this.projects$ = this.select(['entities', 'projects', 'byId'])
      .pipe(
        map(lookupTable => Object.values(lookupTable)),
        this.filterNulls(),
        this.untilDestroyed()
      ) as Observable<Project[]>;

    this.pipeFilterAndTakeUntil(
      this.select<LookupTable<Asset>>(['entities', 'assets', 'byId']))
      .subscribe((lookupTable: LookupTable<Asset>) => {
        this.assets = lookupTable;
      });

    let {
      projects$,
      route,
      communicator,
      checkIn$,
      previewTabsObserver$
    } = this;

    projects$
      .subscribe(entries => this.projects = entries);

    route.data
      .pipe(filter(data => data.project), map(data => data.project))
      .subscribe(project => {
        this.project = project;
        // TODO
        // let tab = new PreviewTab();
        // tab.url = PROJECT_HOME_PAGE;
        // tab.projectCode = project.code;
        // this.dispatch(PreviewTabsActions.nav(tab));
      });

    communicator.subscribe(
      message => this.processMessage(message),
      this.untilDestroyed());

    // this.route.queryParams
    //   .subscribe(params => {
    //     const { open } = params;
    //     if (open) {
    //       this.openFromQueryString(open);
    //     }
    //   });

    // TODO: handle closing project workspace and swiching to global preview mode
    let previewTabs$ = this.pipeFilterAndTakeUntil(
      this.select<PreviewTabStateContainer>(
        notNullOrUndefined(this.state.activeProjectCode)
          ? ['workspaceRef', 'previewTabs']
          : 'previewTabs'));

    previewTabs$
      .subscribe(container => this.previewTabsStateChanged(container));

    previewTabs$
      .pipe(
        switchMap(() => previewTabsObserver$.pipe(takeUntil(checkIn$))),
        filter(() => this.activeTabType === 'iFrameComponent'),
        this.untilDestroyed()
      )
      .subscribe(url => {
        try {
          this.iFrameComponent.navigate(url);
        } catch (e) {
          // if coming from another component (i.e. not the iFrameComponent)
          // the iframe might not be in the document yet so move the navigation
          // to the next call stack queue.
          setTimeout(() => this.iFrameComponent.navigate(url));
        }
      });

    this.previewTabs$ = previewTabs$;

  }

  ngAfterViewInit() {

    this.input.changes
      .pipe(take(1))
      .subscribe(() => this.urlBox.select());

    this.previewTabs$
      .pipe(take(1))
      .subscribe((container: PreviewTabStateContainer) => {
        this.previewTabsObserver$.next(container.byId[container.activeId].url);
      });

  }

  private previewTabsStateChanged(container) {

    let
      tab = container.byId[container.activeId],
      asset = this.assets[tab.assetId],
      prevTab = this.activeTab;

    this.tabs = container.order.map(id => container.byId[id]);
    this.activeTab = tab;
    this.activeTabAsset = asset;
    this.activeTabType = isNullOrUndefined(asset)
      ? 'iFrameComponent'
      : FileAssociations[asset.type] || 'SyntaxHighlighterComponent';

    if ((!prevTab) || (prevTab !== tab)) {
      // e.g. tab opened in background
      this.previewTabsObserver$.next(tab.url);
    }

    if (isNullOrUndefined(this.project) || (this.project.code !== tab.projectCode)) {
      if (tab.projectCode) {
        this.setProject(tab.projectCode);
      } else {
        let code = this.cookieService.get(COOKIE);
        if (code) {
          this.setProject(code);
        } else {
          this.projects$
            .subscribe(projects => this.setProject(projects[0].code));
        }
      }
    }

  }

  private openFromQueryString(open) {
    let tab;
    let firstFoundIndex = null;
    const tabs = this.tabs;
    const tabsToOpen = JSON.parse(open)
    // Filter out tabs that are already opened
      .filter((data) => (
        tabs.filter((previewTab, i) => {
          if (data[0] === previewTab.projectCode && data[1] === previewTab.url) {
            if (firstFoundIndex === null) {
              // First found currently opened tab from the requested 'open' tabs
              // will be given focus
              firstFoundIndex = i;
            }
            return true;
          } else {
            return false;
          }
        }).length < 1
      ));

    if (tabsToOpen.length === 0) {
      this.selectTab(tabs[firstFoundIndex]);
    } else {
      tabsToOpen.forEach((item, i) => {
        let url = item[1];
        let projectCode = item[0];
        let title = (item[2] || '');
        if (i === 0) {
          tab = this.activeTab;
          tab.url = url;
          tab.title = title;
          tab.isNew = false;
          tab.projectCode = projectCode;
        } else {
          tab = createPreviewTabCore({
            url, title, projectCode, assetId: null
          });
        }
      });
      this.requestGuestNavigation(tab.url, tab.projectCode);
    }
    this.router.navigate([`/project/${tabs[0].projectCode}/preview`]);
  }

  private processMessage(message) {
    switch (message.topic) {
      case WindowMessageTopicEnum.GUEST_CHECK_IN:
        this.onGuestCheckIn(message.data);
        break;
      case WindowMessageTopicEnum.GUEST_LOAD_EVENT:
        this.onGuestLoadEvent(message.data);
        break;
      // case WindowMessageTopicEnum.NAV_REQUEST:
      //   this.processOpenItemRequest(message.data);
      //   break;
      default:
        pretty('orange', 'PreviewComponent.processMessage: Unhandled messages ignored.', message);
        break;
    }
  }

  private onGuestCheckIn(data) {

    clearTimeout(this.guestLoadControlTimeout);

    if (data.title === LANDING_PAGE_TITLE) {
      // Brand new tab opened...
      // if (!this.activeTab.isNew) {
      //   this.requestGuestNavigation(this.activeTab.url);
      // }
    } else if (data.title === ERROR_PAGE_TITLE) {
      // Do something?
    } else {

      this.checkIn$.next(data);

      // TODO: temp, guest should send these props once the API powers it
      delete data.location;
      data.projectCode = this.activeTab.projectCode;
      data.assetId = this.activeTab.assetId;

      this.store.dispatch(
        this.previewTabActions.checkIn(data));

    }

  }

  private onGuestLoadEvent(data) {
    clearTimeout(this.guestLoadControlTimeout);
  }

  private requestGuestNavigation(url, projectCode = this.project ? this.project.code : null) {
    clearTimeout(this.guestLoadControlTimeout);
    if (projectCode) {
      this.projects$
        .subscribe(() => {
          this.setProject(projectCode);
          this.requestGuestNavigation(url, projectCode);
        });
    } else {
      // If an external URL is loaded if there's an error in the load
      if (isExternalURL(this.activeTab.url)) {
        this.startGuestLoadErrorTimeout(10000);
      }
      // this.communicate(WindowMessageTopicEnum.HOST_NAV_REQUEST, url);
    }
  }

  private communicate(topic: WindowMessageTopicEnum,
                      data = null,
                      scope: WindowMessageScopeEnum = WindowMessageScopeEnum.External) {
    this.communicator.publish(topic, data, scope);
  }

  private setProject(projectOrProjectCode) {
    if (projectOrProjectCode instanceof Project) {
      this.project = projectOrProjectCode;
    } else if (!this.project || this.project.code !== projectOrProjectCode) {
      // pretty('yellow', `setProject(${projectOrProjectCode})`);
      if (this.projects) {
        this.project = this.projects
          .find(project => project.code === projectOrProjectCode);
      } else {
        this.projects$
          .subscribe(() => {
            // pretty('red', 'this.projects$ (next)');
            this.setProject(projectOrProjectCode);
          });
      }
    }
  }

  private startGuestLoadErrorTimeout(wait = IFRAME_LOAD_CONTROL_TIMEOUT) {
    clearTimeout(this.guestLoadControlTimeout);
    this.guestLoadControlTimeout = setTimeout(() => {
      showSnackBar(this.snackBar, 'This tab is not communicating with studio.', 'Learn More');
      // this.activeTab.navigate(null, IFRAME_ERROR_URL, 'No Check-In Error');
    }, wait);
  }

  /*
   * Navigator
   * */

  beforeIFrameNav() {
    let tab = this.activeTab;
    if (tab.projectCode) {
      this.cookieService.set(COOKIE, tab.projectCode, null, '/');
    }
  }

  @dispatch()
  back() {
    return this.previewTabActions.back(this.activeTab.id);
  }

  @dispatch()
  forward() {
    return this.previewTabActions.forward(this.activeTab.id);
  }

  reload() {
    this.iFrameComponent.reload();
  }

  @dispatch()
  addTab() {
    this.urlBox.select();
    return this.previewTabActions.open(createPreviewTabCore({
      url: this.iFrameLandingUrl,
      title: 'New Tab',
      projectCode: this.project.code
    }));
  }

  @dispatch()
  requestUrl(url) {
    if (url === '') {
      url = '/';
    }
    let tab = this.activeTab;
    if (tab.url === url) {
      this.reload();
      return false;
    } else {
      return this.previewTabActions.nav(
        createPreviewTabCore({ url, projectCode: tab.projectCode }));
    }
  }

  @dispatch()
  changeProject(project) {
    if (project.code === this.project.code) {
      return false;
    } else {
      return this.previewTabActions.nav(createPreviewTabCore({
        url: PROJECT_HOME_PAGE,
        projectCode: project.code
      }));
    }
  }

  @dispatch()
  selectTab(tab) {
    if (tab.id !== this.activeTab.id) {
      return this.previewTabActions.select(tab.id);
    } else {
      return false;
    }
  }

  @dispatch()
  closeTab(tab) {
    return this.previewTabActions.close(tab.id);
  }

  onIFrameLoadEvent(nativeLoadEvent) {
    clearTimeout(this.guestLoadControlTimeout);
    let activeTab = this.activeTab;
    if (!isExternalURL(activeTab.url)) {
      // The IFrame notifies it's load. Studio expects the page to check in close to the onload event
      // If not, this is likely some form of error like...
      // - The page doesn't exist or some other form of HTTP error
      // - The loaded page doesn't have the guest script/imported or set up correctly to communicate with Studio
      this.startGuestLoadErrorTimeout();
    } else if (activeTab.pending) {
      // activeTab.notifyExternalLoad();
    }
  }

}
