import {AfterViewInit, Component, ElementRef, OnDestroy, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {SiteService} from '../../../services/site.service';
import {CookieService} from 'ngx-cookie-service';
import {Site} from '../../../models/site.model';
import {CommunicationService} from '../../../services/communication.service';
import {MessageScope, MessageTopic} from '../../../classes/communicator';
import {uuid} from '../../../app.utils';

declare var $;
const logStyles = 'background: #ddd; color: #333';

const COOKIE = 'crafterSite';
const LANDING_PAGE_TITLE = '** Crafter Studio Preview **';
const IFRAME_LANDING_URL = '/app/assets/guest.landing.html';

interface HistoryItem {
  url: string;
  title: string;
  siteCode: string;
}

class PreviewTab {
  public id: string;
  private pending = true; // The guest hasn't checked in
  private historyIndex = -1;
  private history: Array<HistoryItem> = [];

  /**
   * @param url {string}
   * @param title {string}
   * @param siteCode {string} The identifying code of the site this tab refers to
   * @param isNew {boolean} The tab has a 'blank' URL pending user input
   * @param active {boolean} Whether this is the current tab in focus
   * @param render {boolean} To Optimize resources, used to render the
   *                         iframe until the tab receives it's first focus.
   *                         For a future phase where each tab has it's own iframe.
   **/
  constructor(public url: string,
              public title: string,
              public siteCode: string,
              public isNew = false,
              public active = false,
              public render = false) {
    this.id = uuid();
    if (url) {
      this.track({url, title, siteCode});
    }
  }

  back() {
    let history = this.history;
    if (this.hasBack()) {
      let {url, title, siteCode} = history[--this.historyIndex];
      this.setValues(url, title, siteCode);
      this.pending = true;
      return true;
    } else {
      return false;
    }
  }

  hasBack() {
    return this.historyIndex > 0;
  }

  forward() {
    let history = this.history;
    if (this.hasForward()) {
      let {url, title, siteCode} = history[++this.historyIndex];
      this.setValues(url, title, siteCode);
      this.pending = true;
      return true;
    } else {
      return false;
    }
  }

  hasForward() {
    return (this.history.length > 1) && (this.historyIndex < (this.history.length - 1));
  }

  navigate(siteCode, url, title = 'Loading') {
    let history = this.history;
    let index = this.historyIndex;
    let lastIndex = history.length - 1;
    if (index < lastIndex) {
      // Cut the history here
      history.splice(index + 1);
    }
    this.track({url, title, siteCode});
    this.setValues(url, title, siteCode);
  }

  update(url, title, siteCode = this.siteCode) {

    this.url = url;
    this.title = title;
    this.siteCode = siteCode;
    this.pending = false;

    if (this.history.length === 0) {
      this.track({url, title, siteCode});
    } else {
      this.history[this.historyIndex].url = url;
      this.history[this.historyIndex].title = title;
      this.history[this.historyIndex].siteCode = siteCode;
    }

  }

  isPending() {
    return this.pending;
  }

  track(entry: HistoryItem) {
    this.historyIndex++;
    this.history.push(entry);
  }

  private setValues(url, title, siteCode) {
    this.url = url;
    this.title = title;
    this.siteCode = siteCode;
  }
}

// Studio Form Engine URLs are like...
// /studio/form?
//  form=/page/entry&
//  path=/site/website/index.xml&
//  iceComponent=true&
//  site=launcher&
//  edit=true&
//  editorId=b0665d96-2395-14b5-7f2b-3db8fa7286e3

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
export class PreviewComponent implements OnInit, AfterViewInit, OnDestroy {

  site: Site;
  tabs = [
    /*new PreviewTab('/', 'The Launcher', 'launcher'),
    new PreviewTab('/movies', 'Movies', 'launcher'),
    new PreviewTab('/player', 'Player', 'launcher')*/
  ];
  selectedTab: PreviewTab;
  sites: Array<Site>;
  iframeLandingUrl = IFRAME_LANDING_URL;

  private messagesSubscription;

  constructor(private router: Router,
              private route: ActivatedRoute,
              private siteService: SiteService,
              private cookieService: CookieService,
              private communicator: CommunicationService,
              private elementRef: ElementRef) {
  }

  ngOnInit() {

    this.route.data
      .subscribe(data => {
        this.site = data.site;
        this.initTabs();
      });

    this.route.queryParams
      .subscribe(params => {
        const open = params.open;
        if (open) {

          let tab;
          let firstFoundIndex = null;
          const tabs = this.tabs;
          const tabsToOpen = JSON.parse(params.open)
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
      });

    this.siteService
      .all()
      .then((data) => (this.sites = data.entries));

    this.communicator.addOrigin(window.location.origin);
    this.messagesSubscription = this.communicator
      .subscribe(message => this.processMessage(message));
    // this.communicator.addOrigin(window.location.origin);      // Self
    // this.communicator.addOrigin(environment.urlPreviewBase);  // Guest TODO: load from config.
    // this.communicator.addTarget(document.getElementById('previewFrame'));
    // this.communicator.subscribe(message => this.processMessage(message));

  }

  ngAfterViewInit() {
    this.addCommunicatorTargets();
  }

  ngOnDestroy() {
    this.communicator.resetOrigins();
    this.communicator.resetTargets();
    this.messagesSubscription.unsubscribe();
  }

  private initTabs() {
    let tabs = this.tabs;
    if (tabs.length) {
      tabs.forEach((tab) => tab.render = tab.active);
    } else {
      tabs.push(new PreviewTab('', 'New Tab', this.site.code, true));
    }
    this.selectTab(tabs[0]);
  }

  private addCommunicatorTargets() {
    // let iframes = document.querySelectorAll('iframe');
    // Array.from(iframes)
    //   .forEach((iframe) => this.communicator.addTarget(iframe));
    let iframe = this.getIFrame();
    this.communicator.addTarget(iframe);
  }

  private getIFrame() {
    return this.elementRef.nativeElement.querySelector('iframe');
  }

  private processMessage(message) {
    switch (message.topic) {
      case MessageTopic.GUEST_CHECK_IN:
        this.onGuestCheckIn(message.data);
        break;
      default:
        console.log('%c PreviewComponent.processMessage: Unhandled messages ignored. ', logStyles, message);
        break;
    }
  }

  private onGuestCheckIn(data) {
    if (data.title === LANDING_PAGE_TITLE) {
      // Brand new tab opened...
      if (!this.selectedTab.isNew) {
        this.requestGuestNavigation(this.selectedTab.url);
      }
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

  private requestGuestNavigation(url, siteCode = this.site.code) {
    this.setCookie(siteCode);
    this.communicate(MessageTopic.GUEST_NAV_REQUEST, url);
  }

  private communicate(topic: MessageTopic, message?, scope: MessageScope = MessageScope.External) {
    this.communicator.publish(topic, message, scope);
  }

  private setCookie(siteCode) {
    this.cookieService
      .set(COOKIE, siteCode, null, '/');
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
    this.communicate(MessageTopic.GUEST_RELOAD_REQUEST);
  }

  addTab() {
    let tab = new PreviewTab('', 'New Tab', this.site.code, true);
    this.tabs.push(tab);
    this.selectTab(tab);
    $('#address').select();
  }

  requestUrl(url) {
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
      this.communicator.publish(MessageTopic.GUEST_RELOAD_REQUEST);
    } else {
      // Tab is new and no URL has been entered. User is simply
      // selecting the site for the URL that he's about to type...
      tab.siteCode = site.code;
    }
  }

  selectTab(tab) {
    if (tab !== this.selectedTab) {
      this.tabs.forEach((item) => (
        item.active = (item === tab)));
      tab.render = true;
      this.selectedTab = tab;
      this.requestGuestNavigation(tab.isNew ? this.iframeLandingUrl : tab.url, tab.siteCode);
    }
  }

  closeTab(tab) {
    let tabs = this.tabs;
    if (tabs.length) {

      let index = tabs.indexOf(tab);
      tabs = tabs.filter((item) => {
        return item !== tab;
      });

      this.tabs = tabs;

      // If closed was the active one, assign
      // the nearest anterior tab as active
      if (tab.active) {
        tabs[index >= tabs.length ? --index : index].active = true;
        this.selectTab(tabs[index]);
      }

    }
  }

}
