import {
  AfterViewInit,
  Component, ElementRef,
  Inject,
  Input,
  OnDestroy,
  OnInit, QueryList,
  ViewChild, ViewChildren
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { SiteService } from '../../../services/site.service';
import { CookieService } from 'ngx-cookie-service';
import { Site } from '../../../models/site.model';
import { CommunicationService } from '../../../services/communication.service';
import { WindowMessageScopeEnum } from '../../../enums/window-message-scope.enum';
import { makeSub } from '../../../app.utils';
import { Asset } from '../../../models/asset.model';
import { WindowMessageTopicEnum } from '../../../enums/window-message-topic.enum';
import { ComponentWithState } from '../../../classes/component-with-state.class';
import { AppStore } from '../../../state.provider';
import { SubjectStore } from '../../../classes/subject-store.class';
import { AppState } from '../../../classes/app-state.interface';
import { ComponentHostDirective } from '../../component-host.directive';
import { PreviewTab } from '../../../classes/preview-tab.class';
import { take, takeUntil } from 'rxjs/operators';
import { ContentService } from '../../../services/content.service';

// import { trigger, style, transition, animate, keyframes, query, stagger } from '@angular/animations';
// https://angular.io/guide/animations

// declare var $;
const logStyles = 'background: #ddd; color: #333';
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
  @ViewChild(ComponentHostDirective) iFrame: ComponentHostDirective;

  get urlBox() {
    return this.input.first.nativeElement;
  }

  site: Site;
  tabs = [];
  selectedTab: PreviewTab;
  sites: Array<Site>;
  iFrameLandingUrl = IFRAME_LANDING_URL;
  guestLoadControlTimeout = null;

  lang = null;
  content = null;

  constructor(@Inject(AppStore) protected store: SubjectStore<AppState>,
              private router: Router,
              private route: ActivatedRoute,
              private siteService: SiteService,
              private cookieService: CookieService,
              private communicator: CommunicationService,
              private contentService: ContentService) {
    super(store);
  }

  ngOnInit() {

    this.route.data
      .subscribe(data => {
        this.site = data.site || { code: 'launcher', name: 'Launcher' };
        this.initTabs();
      });

    this.route.queryParams
      .subscribe(params => {
        const open = params.open;
        if (open) {
          this.openFromQueryString(open);
        }
      });

    this.siteService
      .all()
      .then((data) => (this.sites = data.entries));

  }

  ngAfterViewInit() {
    this.initializeCommunications();
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
          tab = this.selectedTab;
          tab.url = url;
          tab.title = title;
          tab.isNew = false;
          tab.siteCode = siteCode;
        } else {
          tab = new PreviewTab(url, title, siteCode, false);
          tabs.push(tab);
        }
      });
      this.requestGuestNavigation(tab.url, tab.siteCode);
    }
    this.router.navigate([`/site/${tabs[0].siteCode}/preview`]);
  }

  private processOpenItemRequest(asset: Asset) {

    const tabs = this.tabs;
    let
      tab, i, l = tabs.length,
      found = false;

    // Find if the requested preview URL is already within the opened tabs.
    for (i = 0; i < l; ++i) {
      tab = tabs[i];
      if (asset.siteCode === tab.siteCode && asset.url === tab.url) {
        found = true;
        break;
      }
    }

    if (found) {
      this.selectTab(tab);
    } else {

      let
        url = asset.url,
        siteCode = asset.siteCode,
        title = asset.label;

      tab = this.selectedTab;
      tab.url = url;
      tab.title = title;
      tab.isNew = false;
      tab.siteCode = siteCode;
      tab.asset = asset;

      this.requestGuestNavigation(tab.url, tab.siteCode);

    }

    this.contentService
      .content(asset.siteCode, asset.id)
      .subscribe(a => {
        this.content = a.content;
        this.lang = asset.type;
      });

  }

  private initTabs() {
    let tabs = this.tabs;
    if (tabs.length === 0) {
      tabs.push(new PreviewTab('', 'New Tab', this.site.code, true));
    }
    this.selectTab(tabs[0]);
  }

  private getIFrame() {
    return this.iFrame.elem;
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
        console.log('%c PreviewComponent.processMessage: Unhandled messages ignored. ', logStyles, message);
        break;
    }
  }

  private onGuestCheckIn(data) {
    clearTimeout(this.guestLoadControlTimeout);
    if (data.title === LANDING_PAGE_TITLE) {
      // Brand new tab opened...
      if (!this.selectedTab.isNew) {
        this.requestGuestNavigation(this.selectedTab.url);
      }
    } else if (data.title === ERROR_PAGE_TITLE) {
      // Do something?
    } else {
      if (this.selectedTab.isPending()) {
        // Studio requested guest to go to X and this is the check in from that request
        this.selectedTab.update(data.url, data.title);
      } else {
        // Navigation occurred guest side without studio requesting it (e.g. user clicked a link on the page)
        this.selectedTab.navigate(this.selectedTab.siteCode, data.url, data.title);
      }
    }
  }

  private onGuestLoadEvent(data) {
    clearTimeout(this.guestLoadControlTimeout);
  }

  private requestGuestNavigation(url, siteCode = this.site.code) {
    this.setCookie(siteCode);
    this.setIFrameURL(url);
    clearTimeout(this.guestLoadControlTimeout);
    // If an external URL is loaded if there's an error in the load
    // if (this.selectedTab.isExternal()) {
    //   this.startGuestLoadErrorTimeout(10000);
    // }
    // this.communicate(WindowMessageTopicEnum.HOST_NAV_REQUEST, url);
  }

  private setIFrameURL(url) {
    this.getIFrame().src = url;
  }

  private communicate(topic: WindowMessageTopicEnum,
                      data = null,
                      scope: WindowMessageScopeEnum = WindowMessageScopeEnum.External) {
    this.communicator.publish(topic, data, scope);
  }

  private setCookie(siteCode) {
    this.cookieService
      .set(COOKIE, siteCode, null, '/');
  }

  private startGuestLoadErrorTimeout(wait = IFRAME_LOAD_CONTROL_TIMEOUT) {
    clearTimeout(this.guestLoadControlTimeout);
    this.guestLoadControlTimeout = setTimeout(() => {
      this.getIFrame().src = IFRAME_ERROR_URL;
    }, wait);
  }

  private initializeCommunications() {
    let
      iFrame = this.getIFrame(),
      origin = window.location.origin;
    this.communicator.addTarget(iFrame);
    this.communicator.addOrigin(origin);
    // this.communicator.addOrigin(environment.urlPreviewBase);  // Guest TODO: load from config.
    this.communicator.subscribe(message => this.processMessage(message), this.until);
    this.addTearDown(() => {
      this.communicator.removeOrigin(origin);
      this.communicator.removeTarget(iFrame);
    });
  }

  /*
   * Navigator
   * */

  back() {
    let tab = this.selectedTab;
    if (tab.back()) {
      this.requestGuestNavigation(tab.url, tab.siteCode);
    }
  }

  forward() {
    let tab = this.selectedTab;
    if (tab.forward()) {
      this.requestGuestNavigation(tab.url, tab.siteCode);
    }
  }

  reload() {
    if (this.selectedTab.isExternal()) {
      this.setIFrameURL(this.selectedTab.url);
    } else {
      this.communicate(WindowMessageTopicEnum.HOST_RELOAD_REQUEST);
    }
  }

  addTab() {
    let tab = new PreviewTab('', 'New Tab', this.site.code, true);
    this.tabs.push(tab);
    this.selectTab(tab);
    this.urlBox.select();
  }

  requestUrl(url) {
    if (url === '') {
      url = '/';
    }
    let tab = this.selectedTab;
    tab.isNew = false;
    tab.navigate(tab.siteCode, url);
    this.requestGuestNavigation(url, tab.siteCode);
  }

  changeSite(site) {
    this.setCookie(site.code);
    let tab = this.selectedTab;
    if (!tab.isNew) {
      // Tab isn't new and navigation should occur. Directing to the '/' path of the selected site.
      tab.navigate(site.code, '/');
      this.communicator.publish(WindowMessageTopicEnum.HOST_RELOAD_REQUEST);
    } else {
      // Tab is new and no URL has been entered. User is simply
      // selecting the site for the URL that he's about to type...
      tab.siteCode = site.code;
    }
  }

  selectTab(tab) {
    if (tab !== this.selectedTab) {
      this.selectedTab = tab;
      this.requestGuestNavigation(
        tab.isNew
          ? this.iFrameLandingUrl
          : tab.url,
        tab.siteCode);
    }
  }

  closeTab(tab) {
    let tabs = this.tabs;
    if (tabs.length > 1) {
      let
        active = this.selectedTab,
        index = tabs.indexOf(tab);
      // If closed was the active one, assign
      // the nearest anterior tab as active
      if (tab === active) {
        tabs[index >= tabs.length ? --index : index].active = true;
        this.selectTab(tabs[index]);
      }
      tabs.splice(index, 1);
    }
  }

  onIFrameLoadEvent(nativeLoadEvent) {
    clearTimeout(this.guestLoadControlTimeout);
    let selectedTab = this.selectedTab;
    if (!selectedTab || !selectedTab.isExternal()) {
      // The IFrame notifies it's load. Studio expects the page to check in close to the onload event
      // If not, this is likely some form of error like...
      // - The page doesn't exist or some other form of HTTP error
      // - The loaded page doesn't have the guest script/imported or set up correctly to communicate with Studio
      // this.startGuestLoadErrorTimeout();
    } else if (selectedTab.isExternal()) {
      if (selectedTab.isPending()) {
        selectedTab.notifyExternalLoad();
      }
    }
  }

}
