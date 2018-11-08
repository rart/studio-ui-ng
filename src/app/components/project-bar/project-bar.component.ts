import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'std-project-bar',
  templateUrl: './project-bar.component.html',
  styleUrls: ['./project-bar.component.scss']
})
export class ProjectBarComponent implements OnInit {

  @Input() links = [];
  @Input() trees = [];

  expandedPanels = {};

  constructor() { }

  ngOnInit() {

  }

  getProjectNavPanelKey(item?) {
    let id = item
      ? item.label
        .toLowerCase()
        .replace(/ /g, '')
      : '';
    return `sidebar.projectnav.${id}`;
  }

  projectNavPanelExpandedStateChange(tree, expanded) {

  }

  showChildLinks(item) {
    console.log(item);
  }

}
