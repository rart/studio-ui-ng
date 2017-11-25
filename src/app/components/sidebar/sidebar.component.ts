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
import { Store } from 'redux';
import { AppState } from '../../classes/app-state.interface';
import { Actions } from '../../../state/expanded-panels.state';
import { User } from '../../models/user.model';
import { ComponentHostDirective } from '../component-host.directive';
import { ContentTreeComponent } from '../site/content-tree/content-tree.component';

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
export class SidebarComponent implements OnInit, AfterViewInit {

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

  constructor(@Inject(AppStore)
              private store: Store<AppState>,
              private studioService: StudioService,
              private componentFactoryResolver: ComponentFactoryResolver,
              private cdr: ChangeDetectorRef) {
  }

  ngOnInit() {

    this.store.subscribe(() => this.stateChanged());

    this.user = this.store.getState().user;

    this.updateExpandedPanelMap();

    this.studioService.getSidebarItems()
      .then((sidebarDescriptor) => {
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
          {component, config} = componentHost.data,
          componentClass = COMPONENT_MAP[component],
          componentFactory: ComponentFactory<any>;

        componentFactory = this.componentFactoryResolver
          .resolveComponentFactory(componentClass);

        viewContainerRef = componentHost.viewContainerRef;
        viewContainerRef.clear();

        componentRef = viewContainerRef.createComponent(componentFactory);

        if (componentClass === ContentTreeComponent) {
          component = <ContentTreeComponent>componentRef.instance;
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
      : ''
    return `sidebar.sitenav.${id}`;
  }

  siteNavPanelExpandedStateChange(nav, expanded) {
    let key = this.getSiteNavPanelKey(nav);
    this.panelExpandedStatechange(key, expanded);
  }

  appNavPanelExpandedStateChange(expanded) {
    this.panelExpandedStatechange(APP_NAV_KEY, expanded);
  }

  private panelExpandedStatechange(key, expanded) {
    let action;
    this.store.dispatch(
      expanded
        ? Actions.expand(key)
        : Actions.collapse(key));
  }

  private stateChanged() {
    this.updateExpandedPanelMap();
  }

  private updateExpandedPanelMap() {

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
