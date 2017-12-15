import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { AppState, EditSession, EditSessions, LookUpTable } from '../../classes/app-state.interface';
import { dispatch, NgRedux, select } from '@angular-redux/store';
import { WithNgRedux } from '../../classes/with-ng-redux.class';
import { Asset } from '../../models/asset.model';
import { CodeEditorChoiceEnum } from '../../classes/code-editor.abstract';
import { filter, map, mergeMap, switchMap, take, tap } from 'rxjs/operators';
import { AssetActions } from '../../actions/asset.actions';
import 'rxjs/add/observable/forkJoin';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { isNullOrUndefined } from 'util';

@Component({
  selector: 'std-edit',
  templateUrl: './edit.component.html',
  styleUrls: ['./edit.component.scss']
})
export class EditComponent extends WithNgRedux implements OnInit {

  @select('editSessions')
  editSessions$: Observable<EditSessions>;

  @select(['entities', 'assets', 'byId'])
  assets$: Observable<EditSessions>;

  requirementsMet$ = new BehaviorSubject(false);
  requirementsMet = false;

  assets: LookUpTable<Asset>;
  active: EditSession;
  sessions: EditSession[] = [];

  renderer: string;

  constructor(store: NgRedux<AppState>,
              private assetActions: AssetActions) {
    super(store);
  }

  ngOnInit() {

    let { editSessions$, assets$, unSubscriber$ } = this;

    assets$
      .pipe(...this.noNullsAndUnSubOps)
      .subscribe((x: any) => this.assets = x);

    editSessions$
      .pipe(...this.noNullsAndUnSubOps)
      .subscribe((sessions: EditSessions) => {
        this.sessionChanged(sessions);
      });

    editSessions$
      .pipe(...this.noNullsAndUnSubOps, take(1))
      .subscribe((sessions: EditSessions) => {

        let query = [];
        let observables = [];

        Object.values(sessions.byId)
          .forEach(y => {
            query.push({ projectCode: y.projectCode, assetId: y.assetId });
            observables.push(
              this.select(['entities', 'assets', 'byId', y.assetId])
                .pipe(
                  filter(r => !isNullOrUndefined(r)),
                  take(1)
                )
            );
          });

        Observable
          .forkJoin(observables)
          .subscribe(assets => {
            this.assets = assets.reduce((oMap: any, asset: Asset) => {
              oMap[asset.id] = asset;
              return oMap;
            }, {});
            this.requirementsMet$.next(true);
          });

        // First time load, reqs might not have been met but navigating away and back
        // they would be met. The above fork of observables would determine that by firing
        // requirementsMet$ synchronously instead of async.
        this.requirementsMet$
          .pipe(take(1))
          .subscribe((met) => {
            if (!met) {
              this.dispatch(this.assetActions.fetchSome(query));
            }
          });


      });

    this.addTearDown(() => {
      this.requirementsMet$.complete();
    });

  }

  sessionChanged(sessions: EditSessions) {
    this.sessions = sessions.order.map(sid => sessions.byId[sid]);
    if (!isNullOrUndefined(sessions.activeId)) {
      this.active = sessions.byId[sessions.activeId];
      if (this.active) {
        this.renderer = 'CodeEditorComponent';
      }
    } else {
      this.active = null;
      this.renderer = 'none';
    }
  }

  @dispatch()
  updateSession(descriptor) {
    return this.assetActions.updateEditSession(descriptor.id, descriptor.data);
  }

  @dispatch()
  selectTab(tab) {
    if (tab !== this.active) {
      return this.assetActions.setActiveSession(tab);
    } else {
      return { type: 'NOOP' };
    }
  }

  @dispatch()
  closeTab(tab) {
    if (tab) {
      return this.assetActions.closeEditSession(tab, this.assets[tab.assetId]);
    } else {
      return { type: 'NOOP' };
    }
  }

}
