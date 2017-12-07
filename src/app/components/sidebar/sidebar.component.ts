import {
  OnInit,
  AfterViewInit,
  Inject,
  Component,
  ViewChildren,
  ComponentFactoryResolver, ComponentFactory, QueryList, ChangeDetectorRef, HostBinding
} from '@angular/core';
import { StudioService } from '../../services/studio.service';
import { environment } from '../../../environments/environment';
import { AppStore } from '../../state.provider';
import { AppState } from '../../classes/app-state.interface';
import { ExpandedPanelsActions } from '../../actions/expanded-panels.actions';
import { User } from '../../models/user.model';
import { ComponentHostDirective } from '../component-host.directive';
import { ContentTreeComponent } from '../site/content-tree/content-tree.component';
import { Site } from '../../models/site.model';
import { SiteService } from '../../services/site.service';
import { Observable } from 'rxjs/Observable';
import { ComponentWithState } from '../../classes/component-with-state.class';
import { SubjectStore } from '../../classes/subject-store.class';

const NavItemTypesEnum = {
  Link: 'link',
  Container: 'container',
  Heading: 'heading',
  Component: 'component'
};

const COMPONENT_MAP = {
  'wcm-assets-folder': '',
  'wcm-root-folder': ContentTreeComponent
};

const APP_NAV_KEY = 'sidebar.appnav.panel';

@Component({
  selector: 'std-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss']
})
export class SidebarComponent extends ComponentWithState implements OnInit, AfterViewInit {

  APP_NAV_KEY = APP_NAV_KEY;

  @HostBinding('class.independent-scroll') independentScroll = true;
  @ViewChildren(ComponentHostDirective) cmpHosts: QueryList<ComponentHostDirective>;

  itemTypes = NavItemTypesEnum;
  appNavItems;
  siteNavItems;
  siteCommands;
  studioLogoUrl = `${environment.assetsUrl}/img/crafter_studio_360.png`;
  expandedPanelMap = {};
  user: User;

  sites: Observable<Site[]>;

  constructor(@Inject(AppStore)
              protected store: SubjectStore<AppState>,
              private studioService: StudioService,
              private componentFactoryResolver: ComponentFactoryResolver,
              private cdr: ChangeDetectorRef,
              private siteService: SiteService) {
    super(store);
  }

  ngOnInit() {

    this.subscribeTo('expandedPanels');
    this.expandedPanelsStateChanged();

    this.user = this.state.user;

    this.sites = this.siteService.sites();

    this.studioService.getSidebarItems()
      .subscribe((sidebarDescriptor) => {
        this.appNavItems = sidebarDescriptor.studio;
        this.siteNavItems = sidebarDescriptor.site.nav;
        this.siteCommands = sidebarDescriptor.site.commands;
      });

  }

  ngAfterViewInit() {
    this.cmpHosts.changes
      .subscribe(() => {
        this.initializeContainers();
      });
  }

  initializeContainers() {

    // https://github.com/angular/angular/issues/10762
    // https://github.com/angular/angular/issues/6005
    // https://github.com/angular/angular/issues/17572

    this.cmpHosts
      .forEach((componentHost) => {

        let
          componentRef,
          viewContainerRef,
          { site, cfg } = componentHost.data,
          { component, config } = cfg,
          componentClass = COMPONENT_MAP[component],
          componentFactory: ComponentFactory<any>;

        componentFactory = this.componentFactoryResolver
          .resolveComponentFactory(componentClass);

        viewContainerRef = componentHost.viewContainerRef;
        viewContainerRef.clear();

        componentRef = viewContainerRef.createComponent(componentFactory);

        if (componentClass === ContentTreeComponent) {
          component = <ContentTreeComponent>componentRef.instance;
          component.site = site;
          component.rootPath = config.path;
          component.showRoot = config.showRoot;
        }

      });

    this.cdr.detectChanges();

  }

  runCommand(command) {
    console.log(`Command ${command} requested`);
  }

  getSiteNavPanelKey(item?) {
    let id = item
      ? item.label
        .toLowerCase()
        .replace(/ /g, '')
      : '';
    return `sidebar.sitenav.${id}`;
  }

  siteNavPanelExpandedStateChange(nav, expanded) {
    let key = this.getSiteNavPanelKey(nav);
    this.panelExpandedStateChanged(key, expanded);
  }

  appNavPanelExpandedStateChange(expanded) {
    this.panelExpandedStateChanged(APP_NAV_KEY, expanded);
  }

  private panelExpandedStateChanged(key, expanded) {
    let action;
    this.store.dispatch(
      expanded
        ? ExpandedPanelsActions.expand(key)
        : ExpandedPanelsActions.collapse(key));
  }

  private expandedPanelsStateChanged() {

    const expandedPanels = this.store.getState().expandedPanels;
    const expandedPanelMap = {};
    const panelKeySubstr = this.getSiteNavPanelKey();

    expandedPanels.forEach(key => {
      // Filter out panels from the rest of the app.
      if (key === APP_NAV_KEY || key.includes(panelKeySubstr)) {
        expandedPanelMap[key] = true;
      }
    });

    this.expandedPanelMap = expandedPanelMap;

  }

}
