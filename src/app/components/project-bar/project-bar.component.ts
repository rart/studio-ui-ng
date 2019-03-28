import { Component, Input, OnInit } from '@angular/core';
import { animate, style, transition, trigger } from '@angular/animations';

const SELECTOR = '.project-bar__nav';

@Component({
  selector: 'std-project-bar',
  templateUrl: './project-bar.component.html',
  styleUrls: ['./project-bar.component.scss'],
  animations: [
    trigger(
      'enterAnimation', [
        transition(':enter', [
          style({ transform: 'translateX(-100%)', opacity: 0, position: 'absolute' }),
          animate('200ms', style({ transform: 'translateX(0)', opacity: 1 }))
        ]),
        transition(':leave', [
          style({ transform: 'translateX(0)', opacity: 1, position: 'absolute' }),
          animate('200ms', style({ transform: 'translateX(-100%)', opacity: 0 }))
        ])
      ]
    )
  ]
})
export class ProjectBarComponent implements OnInit {

  @Input() links = [];
  @Input() trees = [];

  activeParent = null;
  expandedPanels = {};

  constructor() {
  }

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
    this.activeParent = item;
    if (item) {

    } else {

    }
  }

}
