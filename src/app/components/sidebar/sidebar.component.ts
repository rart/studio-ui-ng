import {
  OnInit,
  AfterViewInit,
  Component,
  ViewChildren,
  ComponentFactoryResolver,
  ComponentFactory,
  QueryList,
  ChangeDetectorRef,
} from '@angular/core';
import { StudioService } from '../../services/studio.service';
import { AppState, LookupTable, Workspace } from '../../classes/app-state.interface';
import { ExpandedPanelsActions } from '../../actions/expanded-panels.actions';
import { User } from '../../models/user.model';
import { ComponentHostDirective } from '../component-host.directive';
import { ContentTreeComponent } from '../content-tree/content-tree.component';
import { Project } from '../../models/project.model';
import { NgRedux, dispatch, select } from '@angular-redux/store';
import { WithNgRedux } from '../../classes/with-ng-redux.class';
import { ComponentRef } from '@angular/core/src/linker/component_factory';
import { takeUntil } from 'rxjs/operators';
import { ProjectActions } from '../../actions/project.actions';

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
export class SidebarComponent extends WithNgRedux implements OnInit, AfterViewInit {

  APP_NAV_KEY = APP_NAV_KEY;

  @ViewChildren(ComponentHostDirective) cmpHosts: QueryList<ComponentHostDirective>;

  itemTypes = NavItemTypesEnum;
  appNavItems;
  projectNavItems;
  projectCommands;
  user: User;

  project: Project;
  projects: Project[];

  @select(['editSessions', 'order'])
  editSessions$;

  onProjectChanged$;

  componentRefs: ComponentRef<any>[] = [];

  expandedPanels: { [key: string]: boolean } = {};

  constructor(store: NgRedux<AppState>,
              private studioService: StudioService,
              private componentFactoryResolver: ComponentFactoryResolver,
              private cdr: ChangeDetectorRef,
              private projectActions: ProjectActions) {
    super(store);
  }

  ngOnInit() {

    this.onProjectChanged$ =
      this.select('projectRef')
        .pipe(this.untilDestroyed());

    this.pipeFilterAndTakeUntil(
      this.select(['entities', 'projects', 'byId']))
      .subscribe((lookupTable: LookupTable<Project>) => {
        this.projects = Object.values(lookupTable);
      });

    this.pipeFilterAndTakeUntil(
      this.select('workspaceRef'))
      .subscribe((workspace: Workspace) => {
        this.expandedPanels = workspace.expandedPanels;
      });

    this.onProjectChanged$
      .subscribe((project: Project) => {
        this.project = project;
      });

    this.user = this.state.user;

    this.studioService
      .getGlobalNav()
      .subscribe(sidebarDescriptor => {
        this.appNavItems = sidebarDescriptor.studio;
        this.projectNavItems = sidebarDescriptor.project.nav;
        this.projectCommands = sidebarDescriptor.project.commands;
      });

  }

  ngAfterViewInit() {

    this.cmpHosts.changes
      .subscribe(() => {
        this.onProjectChanged$
          .pipe(
            this.filterNulls(),
            takeUntil(this.cmpHosts.changes)
          )
          // TODO: revise
          // When project is changed, the [data] binding on the stdComponentHost
          // Isn't updated quite yet by angular hence the tree components are initialized
          // with the old project
          .subscribe(() => setTimeout(() => this.initializeContainers()));
      });

  }

  initializeContainers() {

    let { componentRefs } = this;

    if (componentRefs.length > 0) {
      componentRefs.forEach(componentRef => componentRef.destroy());
    }

    // https://github.com/angular/angular/issues/10762
    // https://github.com/angular/angular/issues/6005
    // https://github.com/angular/angular/issues/17572

    this.cmpHosts
      .forEach((componentHost) => {

        let
          componentRef: ComponentRef<any>,
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

        componentRefs.push(componentRef);

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

  @dispatch()
  selectProject(code: string) {
    return this.projectActions.select(code);
  }

  @dispatch()
  closeWorkspace() {
    return this.projectActions.deselect(this.project.code);
  }

}
