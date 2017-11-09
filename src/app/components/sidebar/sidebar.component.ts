import {Component, ComponentFactoryResolver, OnInit} from '@angular/core';
import {StudioService} from '../../services/studio.service';
import {environment} from '../../../environments/environment';

const NavItemTypes = {
  Link: 'link',
  Container: 'container',
  Heading: 'heading',
  Component: 'component'
};

// import {ContentTreeComponent} from '../site/content-tree/content-tree.component';
// import {} from '../site/content-tree/content-tree.component';
const COMPONENT_MAP = {
  'wcm-assets-folder': '',
  'wcm-root-folder': ''
};

declare var require;

@Component({
  selector: 'std-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss']
})
export class SidebarComponent implements OnInit {
  itemTypes = NavItemTypes;
  appNavItems;
  siteNavItems;
  siteCommands;
  studioLogoUrl = `${environment.assetsUrl}/img/crafter_studio_360.png`;

  constructor(private studioService: StudioService,
              private componentFactoryResolver: ComponentFactoryResolver) {}

  ngOnInit() {

    this.studioService.getSidebarItems()
      .then((sidebarDescriptor) => {
        this.appNavItems = sidebarDescriptor.studio;
        this.siteNavItems = sidebarDescriptor.site.nav;
        this.siteCommands = sidebarDescriptor.site.commands;
      });

  }

  runCommand(command) {
    console.log(`Command ${command} requested`);
  }

}
