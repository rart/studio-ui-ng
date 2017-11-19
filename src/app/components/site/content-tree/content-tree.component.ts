import {Component, Input, OnInit} from '@angular/core';
import {Router} from '@angular/router';
import {ITreeOptions, TREE_ACTIONS, TreeNode, ITreeState} from 'angular-tree-component';
import {ContentService} from '../../../services/content.service';
import {CommunicationService} from '../../../services/communication.service';
import {MessageScope, MessageTopic} from '../../../classes/communicator.class';
import {ContentItem} from '../../../models/content-item.model';

@Component({
  selector: 'std-content-tree',
  templateUrl: './content-tree.component.html',
  styleUrls: ['./content-tree.component.scss']
})
export class ContentTreeComponent implements OnInit {

  @Input() rootPath: string;

  site = {code: 'launcher'};
  nodes;
  rootItem: ContentItem;
  options: ITreeOptions;
  treeState: ITreeState = {
    expandedNodeIds: {
      '/site/website/index.xml': true
    },
    activeNodeIds: {},
    hiddenNodeIds: {},
    focusedNodeId: null
  };

  constructor(private contentService: ContentService,
              private communicationService: CommunicationService,
              private router: Router) {
  }

  ngOnInit() {

    this.fetch(this.site.code, this.rootPath)
      .then(item => {
        this.rootItem = item;
        this.nodes = [item];
      });

    this.setTreeOptionDefaults();

  }

  treeStateChanged(e) {

  }

  treeItemClicked(tree, node, $event) {
    if (node.isCollapsed) {
      TREE_ACTIONS.TOGGLE_EXPANDED(tree, node, $event);
    }
    this.router.navigate([`/preview`])
      .then((value) => {
        setTimeout(() => this.communicationService.publish(
          MessageTopic.SITE_TREE_NAV_REQUEST, node.data, MessageScope.Local));
      });
  }

  private fetch(siteCode, path) {
    return this.contentService
      .tree(siteCode, path)
      .toPromise();
  }

  private setTreeOptionDefaults() {
    this.options = {
      displayField: 'label',
      idField: 'internalURL',
      childrenField: 'children',
      nodeHeight: 23,
      animateSpeed: 30,
      animateAcceleration: 1.2,
      allowDrag: false,
      allowDrop: false,
      animateExpand: false,
      useVirtualScroll: false,
      getChildren: (node: TreeNode) => {
        return this
          .fetch(this.site.code, (<ContentItem>node.data).internalURL)
          .then(item => item.children);
      },
      nodeClass: (node: TreeNode) => {
        return 'icon-' + node.data.icon;
      },
      actionMapping: {
        mouse: {
          click: (tree, node, $event) => {
            this.treeItemClicked(tree, node, $event);
          }
        }
      }
    };
  }

}
