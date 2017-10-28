import {Component, OnInit} from '@angular/core';
import {StudioService} from '../../services/studio.service';

const NavItemTypes = {
  Link: 'link',
  Container: 'container',
  Heading: 'heading',
  Component: 'component'
};

const COMPONENT_MAP = {
  'wcm-assets-folder': '',
  'wcm-root-folder': ''
};

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

  constructor(private studioService: StudioService) {}

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
