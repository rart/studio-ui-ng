import { Component, Inject, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ITreeOptions, TREE_ACTIONS, TreeNode, ITreeState } from 'angular-tree-component';
import { ContentService } from '../../../services/content.service';
import { CommunicationService } from '../../../services/communication.service';
import { WindowMessageScopeEnum } from '../../../enums/window-message-scope.enum';
import { Asset } from '../../../models/asset.model';
import { WindowMessageTopicEnum } from '../../../enums/window-message-topic.enum';
import { WorkflowService } from '../../../services/workflow.service';
import { ComponentWithState } from '../../../classes/component-with-state.class';
import { AppStore } from '../../../state.provider';
import { SubjectStore } from '../../../classes/subject-store.class';
import { AppState } from '../../../classes/app-state.interface';
import { ExpandedPathsActions } from '../../../classes/expanded-paths.actions';

@Component({
  selector: 'std-content-tree',
  templateUrl: './content-tree.component.html',
  styleUrls: ['./content-tree.component.scss']
})
export class ContentTreeComponent extends ComponentWithState implements OnInit {

  @Input() rootPath: string;
  @Input() showRoot = true;

  site = { code: 'launcher' };
  nodes;
  rootItem: Asset;
  options: ITreeOptions;
  treeState: ITreeState = {
    expandedNodeIds: {},
    activeNodeIds: {},
    hiddenNodeIds: {},
    focusedNodeId: null
  };

  constructor(@Inject(AppStore) protected store: SubjectStore<AppState>,
              private contentService: ContentService,
              private workflowService: WorkflowService) {
    super(store);
  }

  ngOnInit() {

    this.treeState.expandedNodeIds = Object.assign({}, this.state.expandedPaths);

    this.fetch(this.site.code, this.rootPath)
      .then(item => {
        this.rootPathLoaded(item);
      });

    this.setTreeOptionDefaults();

    this.subscribeTo('expandedPaths');

  }

  expandedPathsStateChanged(expandedPaths) {
    console.log('expandedPathsStateChanged');
    let treeState = this.treeState;
    Object.keys(expandedPaths).forEach(key => treeState.expandedNodeIds[key] = true);
  }

  treeStateChanged(treeState: ITreeState) {
    let
      source = treeState.expandedNodeIds,
      stateExpanded  = Object.keys(this.state.expandedPaths),
      treeExpanded = Object.keys(source)
        .filter(key => !stateExpanded[key]);
    // noinspection TsLint
    treeExpanded.length && this.store.dispatch(ExpandedPathsActions.expandMany(treeExpanded));
  }

  treeItemClicked(tree, node, $event) {
    if (node.isCollapsed) {
      TREE_ACTIONS.TOGGLE_EXPANDED(tree, node, $event);
    }
  }

  private fetch(siteCode, path) {
    return this.contentService
      .tree(siteCode, path)
      .toPromise();
  }

  private setTreeOptionDefaults() {
    this.options = {
      displayField: 'label',
      idField: 'id',
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
          .fetch(this.site.code, (<Asset>node.data).id)
          .then(item => item.children);
      },
      actionMapping: {
        mouse: {
          click: (tree, node, $event) => {
            let classes = $event.target.className;
            if (!(classes.includes('material-icons') || classes.includes('asset-menu'))) {
              this.treeItemClicked(tree, node, $event);
            }
          }
        }
      }
    };
  }

  private rootPathLoaded(asset: Asset) {

    this.rootItem = asset;

    if (this.showRoot) {
      this.nodes = [asset];
    } else {
      this.nodes = asset.children || [];
    }

  }

}
