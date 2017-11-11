import {Component, OnInit} from '@angular/core';
import {ContentService} from '../../../services/content.service';
import {ITreeOptions, TREE_ACTIONS, TreeNode} from 'angular-tree-component';
import {ActivatedRoute, Router} from '@angular/router';
import {CommunicationService} from '../../../services/communication.service';
import {MessageScope, MessageTopic} from '../../../classes/communicator';

@Component({
  selector: 'std-content-tree',
  templateUrl: './content-tree.component.html',
  styleUrls: ['./content-tree.component.scss']
})
export class ContentTreeComponent implements OnInit {

  site = {code: 'launcher'};

  options: ITreeOptions;

  nodes;

  constructor(private contentService: ContentService,
              private communicationService: CommunicationService,
              private router: Router) {
  }

  ngOnInit() {

    /*this.route.data
      .subscribe(data => this.site = data.site);*/

    this.contentService
      .tree('launcher', '/site/website')
      .toPromise()
      .then(item => this.nodes = [item]);

    this.treeOptionDefaults();

  }

  private treeOptionDefaults() {
    this.options = {
      childrenField: 'children',
      displayField: 'label',
      // isExpandedField: '',
      idField: 'internalURL',
      getChildren: (node: TreeNode) => {
        console.log(node);
        // return request('/api/children/' + node.id);
      },
      actionMapping: {
        mouse: {
          click: (tree, node, $event) => {
            // const url = node.data.browserURL || '/';
            // const siteCode = node.data.siteCode;
            // const title = node.data.label;
            // console.log(node, node.data.browserURL, url);
            // this.router.navigate([`/site/${siteCode}/preview`], {
            //   queryParams: { open: JSON.stringify([[siteCode, url, title]]) }
            // });
            this.router.navigate([`/preview`])
              .then((value) => {
                setTimeout(() =>
                  this.communicationService.publish(MessageTopic.SITE_TREE_NAV_REQUEST, node.data, MessageScope.Local));
              });
            if (node.isCollapsed) {
              TREE_ACTIONS.TOGGLE_EXPANDED(tree, node, $event);
            }
          }
        }
      },
      nodeHeight: 23,
      allowDrag: false,
      allowDrop: false,
      useVirtualScroll: false,
      animateExpand: true,
      animateSpeed: 30,
      animateAcceleration: 1.2
    };
  }

}
