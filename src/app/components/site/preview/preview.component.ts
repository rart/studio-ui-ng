import {
  AfterViewInit,
  Component, ContentChild, ElementRef,
  Inject,
  OnDestroy,
  OnInit, QueryList, ViewChild,
  ViewChildren
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { SiteService } from '../../../services/site.service';
import { CookieService } from 'ngx-cookie-service';
import { Site } from '../../../models/site.model';
import { CommunicationService } from '../../../services/communication.service';
import { WindowMessageScopeEnum } from '../../../enums/window-message-scope.enum';
import { Asset } from '../../../models/asset.model';
import { WindowMessageTopicEnum } from '../../../enums/window-message-topic.enum';
import { ComponentWithState } from '../../../classes/component-with-state.class';
import { AppStore } from '../../../state.provider';
import { SubjectStore } from '../../../classes/subject-store.class';
import { AppState } from '../../../classes/app-state.interface';
import { ComponentHostDirective } from '../../component-host.directive';
import { PreviewTab } from '../../../classes/preview-tab.class';
import { filter, map, shareReplay, take } from 'rxjs/operators';
import { Observable } from 'rxjs/Observable';
import { IFrameComponent } from '../../iframe/iframe.component';
import { PreviewTabsActions } from '../../../actions/preview-tabs.actions';
import { MatSnackBar } from '@angular/material';
import { showSnackBar } from '../../../app.utils';

// import { trigger, style, transition, animate, keyframes, query, stagger } from '@angular/animations';
// https://angular.io/guide/animations

const clearTimeout = window.clearTimeout;

const COOKIE = 'crafterSite';
const LANDING_PAGE_TITLE = '** Crafter Studio Preview **';
const ERROR_PAGE_TITLE = '** Crafter Studio Preview ERROR **';
const IFRAME_LANDING_URL = '/app/assets/guest.landing.html';
const IFRAME_ERROR_URL = '/app/assets/guest.500.html';
const IFRAME_LOAD_CONTROL_TIMEOUT = 5000;

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

@Component({
  selector: 'std-preview',
  templateUrl: './preview.component.html',
  styleUrls: ['./preview.component.scss']
})
export class PreviewComponent extends ComponentWithState implements OnInit, AfterViewInit, OnDestroy {

  @ViewChildren('urlBox') input: QueryList<ElementRef>;
  @ViewChild(IFrameComponent) iFrameComponent: IFrameComponent;

  get urlBox() {
    try {
      return this.input.first.nativeElement;
    } catch (e) {
      pretty('RED', 'PreviewComponent: URL input was read but was not found. Returned "fake" input.');
      return document.createElement('input');
    }
  }

  site: Site;
  sites: Array<Site>;
  sites$: Observable<Array<Site>>;

  tabs: PreviewTab[];
  activeTab: PreviewTab;

  iFrameLandingUrl = IFRAME_LANDING_URL;
  guestLoadControlTimeout = null;

  constructor(@Inject(AppStore) protected store: SubjectStore<AppState>,
              private router: Router,
              private route: ActivatedRoute,
              private siteService: SiteService,
              private cookieService: CookieService,
              private communicator: CommunicationService,
              private snackBar: MatSnackBar) {
    super(store);
  }

  ngOnInit() {

    this.route.data
      .pipe(filter(data => data.site))
      .subscribe(data => {
        let { site } = data;
        this.site = site;
        pretty('teal', 'has route data');
        this.setSite(site.code);
      });

    this.route.queryParams
      .subscribe(params => {
        const { open } = params;
        if (open) {
          this.openFromQueryString(open);
        }
      });

    this.sites$ = this.siteService
      .all()
      .pipe(
        map(data => data.entries),
        shareReplay(1));

    this.sites$
      .subscribe(entries => {
        this.sites = entries;
      });

    this.communicator.subscribe(
      message => this.processMessage(message),
      this.until);

    this.subscribeTo(['previewTabs']);
    this.previewTabsStateChanged();

  }

  ngAfterViewInit() {
    this.input.changes
      .pipe(take(1))
      .subscribe(() => this.urlBox.select());
  }

  private openFromQueryString(open) {
    let tab;
    let firstFoundIndex = null;
    const tabs = this.tabs;
    const tabsToOpen = JSON.parse(open)
    // Filter out tabs that are already opened
      .filter((data) => (
        tabs.filter((previewTab, i) => {
          if (data[0] === previewTab.siteCode && data[1] === previewTab.url) {
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
        let siteCode = item[0];
        let title = (item[2] || '');
        if (i === 0) {
          tab = this.activeTab;
          tab.url = url;
          tab.title = title;
          tab.isNew = false;
          tab.siteCode = siteCode;
        } else {
          tab = new PreviewTab();
          tab.url = url;
          tab.title = title;
          tab.siteCode = siteCode;
          tab.isNew = false;
          tabs.push(tab);
        }
      });
      this.requestGuestNavigation(tab.url, tab.siteCode);
    }
    this.router.navigate([`/site/${tabs[0].siteCode}/preview`]);
  }

  private processOpenItemRequest(asset: Asset) {

    const tabs = this.tabs;
    let tab = tabs.find(_tab_ =>
      (asset.siteCode === _tab_.siteCode) && (asset.url === _tab_.url));

    if (tab) {
      // TODO: should be unnecessary if guest sends the asset when it loads
      tab.update(tab.url, tab.title, tab.siteCode, asset);
      // If it's already the active tab, no need to do anything.
      if (!tab.active) {
        this.selectTab(tab);
      }
    } else {
      // Tab's not already opened, so open it...

      let
        url = asset.url,
        siteCode = asset.siteCode,
        title = asset.label;

      tab = this.activeTab;
      tab.navigate(siteCode, url, title, asset);
      tab.isNew = false;

      // this.requestGuestNavigation(url, siteCode);

    }

  }

  private previewTabsStateChanged() {
    let
      state = this.state.previewTabs,
      active = state.find(tab => tab.active);
    this.tabs = [].concat(state);
    this.activeTab = active;
    if (active.siteCode) {
      this.setSite(active.siteCode);
    } else {
      let code = this.cookieService.get(COOKIE);
      if (code) {
        this.setSite(code);
      } else {
        this.sites$
          .subscribe(sites => this.setSite(sites[0].code));
      }
    }
  }

  private processMessage(message) {
    switch (message.topic) {
      case WindowMessageTopicEnum.GUEST_CHECK_IN:
        this.onGuestCheckIn(message.data);
        break;
      case WindowMessageTopicEnum.GUEST_LOAD_EVENT:
        this.onGuestLoadEvent(message.data);
        break;
      case WindowMessageTopicEnum.NAV_REQUEST:
        this.processOpenItemRequest(message.data);
        break;
      default:
        pretty('orange', 'PreviewComponent.processMessage: Unhandled messages ignored.', message);
        break;
    }
  }

  private onGuestCheckIn(data) {
    clearTimeout(this.guestLoadControlTimeout);
    if (data.title === LANDING_PAGE_TITLE) {
      // Brand new tab opened...
      if (!this.activeTab.isNew) {
        this.requestGuestNavigation(this.activeTab.url);
      }
    } else if (data.title === ERROR_PAGE_TITLE) {
      // Do something?
    } else {
      if (this.activeTab.isPending()) {
        // Studio requested guest to go to X and this is the check in from that request
        this.activeTab.update(
          data.url,
          data.title,
          data.asset ? data.asset.siteCode : this.activeTab.siteCode,
          data.asset ? data.asset : this.activeTab.asset);
      } else {
        // Navigation occurred guest side without studio requesting it (e.g. user clicked a link on the page)
        this.activeTab.navigate(this.activeTab.siteCode, data.url, data.title);
      }
    }
  }

  private onGuestLoadEvent(data) {
    clearTimeout(this.guestLoadControlTimeout);
  }

  private requestGuestNavigation(url, siteCode = this.site ? this.site.code : null) {
    clearTimeout(this.guestLoadControlTimeout);
    if (siteCode) {
      this.sites$
        .subscribe(() => {
          this.setSite(siteCode);
          this.requestGuestNavigation(url, siteCode);
        });
    } else {
      // If an external URL is loaded if there's an error in the load
      if (this.activeTab.isExternal()) {
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

  private setSite(siteCode) {
    pretty('yellow', `setSite(${siteCode})`, this.sites);
    if (siteCode) {
      this.cookieService.set(COOKIE, siteCode, null, '/');
      if (this.sites) {
        this.site = this.sites.find(site => site.code === siteCode);
      } else {
        this.sites$
          .subscribe(() => this.setSite(siteCode));
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

  back() {
    let tab = this.activeTab;
    if (tab.back()) {
      this.requestGuestNavigation(tab.url, tab.siteCode);
    }
  }

  forward() {
    let tab = this.activeTab;
    if (tab.forward()) {
      this.requestGuestNavigation(tab.url, tab.siteCode);
    }
  }

  reload() {
    if (this.activeTab.isExternal()) {
      this.iFrameComponent.reload();
    } else {
      this.communicate(WindowMessageTopicEnum.HOST_RELOAD_REQUEST);
    }
  }

  addTab() {
    let tab = new PreviewTab();
    tab.url = this.iFrameLandingUrl;
    tab.title = 'New Tab';
    tab.siteCode = this.site.code;
    tab.isNew = true;
    this.dispatch(PreviewTabsActions.open(tab));
    this.urlBox.select();
  }

  requestUrl(url) {
    if (url === '') {
      url = '/';
    }
    let tab = this.activeTab;
    tab.isNew = false;
    tab.navigate(tab.siteCode, url);
    // this.requestGuestNavigation(url, tab.siteCode);
  }

  changeSite(site) {
    this.setSite(site.code);
    let tab = this.activeTab;
    if (!tab.isNew) {
      // Tab isn't newly opened, hence navigation should occur. Directing to the '/' path of the selected site.
      tab.navigate(site.code, '/');
      this.communicator.publish(WindowMessageTopicEnum.HOST_RELOAD_REQUEST);
    } else {
      // Tab is new and no URL has been entered. User is simply
      // selecting the site for the URL that he's about to type...
      tab.siteCode = site.code;
    }
  }

  selectTab(tab) {
    if (tab !== this.activeTab) {
      this.dispatch(PreviewTabsActions.select(tab.id));
    }
  }

  closeTab(tab) {
    this.dispatch(PreviewTabsActions.close(tab.id));
  }

  onIFrameLoadEvent(nativeLoadEvent) {
    clearTimeout(this.guestLoadControlTimeout);
    let activeTab = this.activeTab;
    if (!activeTab.isExternal()) {
      // The IFrame notifies it's load. Studio expects the page to check in close to the onload event
      // If not, this is likely some form of error like...
      // - The page doesn't exist or some other form of HTTP error
      // - The loaded page doesn't have the guest script/imported or set up correctly to communicate with Studio
      this.startGuestLoadErrorTimeout();
    } else if (activeTab.isExternal()) {
      if (activeTab.isPending()) {
        activeTab.notifyExternalLoad();
      }
    }
  }

}
