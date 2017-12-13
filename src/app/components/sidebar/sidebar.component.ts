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
import { AppState, StateEntity, Workspace } from '../../classes/app-state.interface';
import { ExpandedPanelsActions } from '../../actions/expanded-panels.actions';
import { User } from '../../models/user.model';
import { ComponentHostDirective } from '../component-host.directive';
import { ContentTreeComponent } from '../project/content-tree/content-tree.component';
import { Project } from '../../models/project.model';
import { Observable } from 'rxjs/Observable';
import { ComponentWithState } from '../../classes/component-with-state.class';
import { SubjectStore } from '../../classes/subject-store.class';
import { dispatch, NgRedux, select } from '@angular-redux/store';
import { isNullOrUndefined } from 'util';
import { combineLatest, filter, takeUntil } from 'rxjs/operators';
import { ProjectActions } from '../../actions/project.actions';
import { WithNgRedux } from '../../classes/with-ng-redux.class';

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

// const activeProjectSelector = (state: AppState) => {
//   let
//     id = state.activeProjectCode,
//     projectEntityState = state.entities.project;
//   if (!isNullOrUndefined(id) && !isNullOrUndefined(projectEntityState.list)) {
//     return projectEntityState.byId[id];
//   }
//   return null;
// };

// const expandedPanelStateSelector = (state: AppState) => {
//   let
//     id = state.activeProjectCode,
//     projectEntityState = state.projectsState;
//   if (!isNullOrUndefined(id) && !isNullOrUndefined(projectEntityState.list)) {
//     return projectEntityState[id].expandedPanels;
//   }
//   return null;
// };

@Component({
  selector: 'std-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss']
})
export class SidebarComponent extends WithNgRedux implements OnInit, AfterViewInit {

  APP_NAV_KEY = APP_NAV_KEY;

  @HostBinding('class.independent-scroll') independentScroll = true;
  @ViewChildren(ComponentHostDirective) cmpHosts: QueryList<ComponentHostDirective>;

  itemTypes = NavItemTypesEnum;
  appNavItems;
  projectNavItems;
  projectCommands;
  studioLogoUrl = `${environment.assetsUrl}/img/crafter_studio_360.png`;
  user: User;

  project: Project;
  projects: Project[];

  @select(['entities', 'project'])
  projects$: Observable<StateEntity<Project>>;

  expandedPanels: { [key: string]: boolean } = {};

  constructor(protected store: NgRedux<AppState>,
              private studioService: StudioService,
              private componentFactoryResolver: ComponentFactoryResolver,
              private cdr: ChangeDetectorRef) {
    super(store);
  }

  ngOnInit() {

    this.store.select(['workspaceRef'])
      .pipe(...this.noNullsAndUnSubOps)
      .subscribe((workspace: Workspace) => {
        this.expandedPanels = workspace.expandedPanels;
      });

    this.store.select(['projectRef'])
      .pipe(...this.noNullsAndUnSubOps)
      .subscribe((project: Project) => {
        this.project = project;
      });

    this.user = this.state.user;

    this.studioService
      .getSidebarItems()
      .subscribe(sidebarDescriptor => {
        this.appNavItems = sidebarDescriptor.studio;
        this.projectNavItems = sidebarDescriptor.project.nav;
        this.projectCommands = sidebarDescriptor.project.commands;
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
          { project, cfg } = componentHost.data,
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
          component.project = project;
          component.rootPath = config.path;
          component.showRoot = config.showRoot;
        }

      });

    this.cdr.detectChanges();

  }

  runCommand(command) {
    console.log(`Command ${command} requested`);
  }

  getProjectNavPanelKey(item?) {
    let id = item
      ? item.label
        .toLowerCase()
        .replace(/ /g, '')
      : '';
    return `sidebar.projectnav.${id}`;
  }

  projectNavPanelExpandedStateChange(nav, expanded) {
    let key = this.getProjectNavPanelKey(nav);
    this.panelExpandedStateChanged(key, expanded);
  }

  appNavPanelExpandedStateChange(expanded) {
    this.panelExpandedStateChanged(APP_NAV_KEY, expanded);
  }

  @dispatch()
  private panelExpandedStateChanged(key, expanded) {
    return expanded
      ? ExpandedPanelsActions.expand(key, this.project.code)
      : ExpandedPanelsActions.collapse(key, this.project.code);
  }

}
