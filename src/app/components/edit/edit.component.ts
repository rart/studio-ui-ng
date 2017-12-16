import { AfterViewInit, Component, Inject, OnInit, QueryList, ViewChildren } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/forkJoin';
import { AppState, EditSession, EditSessions, LookUpTable } from '../../classes/app-state.interface';
import { dispatch, NgRedux, select } from '@angular-redux/store';
import { WithNgRedux } from '../../classes/with-ng-redux.class';
import { Asset } from '../../models/asset.model';
import { filter, skip, switchMap, take, takeUntil, takeWhile, tap } from 'rxjs/operators';
import { AssetActions } from '../../actions/asset.actions';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { notNullOrUndefined } from '../../app.utils';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material';
import { openDialog } from '../../utils/material.utils';
import { ComponentHostDirective } from '../component-host.directive';
import { EditorComponent } from '../editor/editor.component';

@Component({
  selector: 'std-edit',
  templateUrl: './edit.component.html',
  styleUrls: ['./edit.component.scss']
})
export class EditComponent extends WithNgRedux implements OnInit, AfterViewInit {

  @ViewChildren(EditorComponent) componentsQL: QueryList<EditorComponent>;

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
  renderedComponent: { save: () => void };

  waitingSaveToClose$ = new BehaviorSubject(false);

  constructor(store: NgRedux<AppState>,
              private assetActions: AssetActions,
              public dialog: MatDialog) {
    super(store);
  }

  ngOnInit() {

    let { editSessions$, assets$, unSubscriber$, waitingSaveToClose$ } = this;

    assets$
      .pipe(...this.noNullsAndUnSubOps)
      .subscribe((x: any) => this.assets = x);

    waitingSaveToClose$
      .pipe(
        filter(x => !x),
        switchMap(() =>
          editSessions$.pipe(
            takeUntil(
              waitingSaveToClose$.pipe(skip(1))
            ))
        )
      )
      .subscribe((sessions: EditSessions) => {
        this.sessionsChanged(sessions);
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
                  filter(r => notNullOrUndefined(r)),
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

  ngAfterViewInit() {
    this.componentsQL.changes
      .subscribe((ql) => {
        if (ql.length > 0) {
          this.renderedComponent = ql.first;
        }
      });
  }

  sessionsChanged(sessions: EditSessions) {
    this.sessions = sessions.order.map(sid => sessions.byId[sid]);
    if (notNullOrUndefined(sessions.activeId)) {
      let
        nextActive = sessions.byId[sessions.activeId],
        prevActive = this.active;
      this.active = nextActive;
      if (nextActive) {
        this.renderer = 'CodeEditorComponent';
      }
    } else {
      this.active = null;
      this.renderer = 'none';
    }
  }

  @dispatch()
  updateSession(descriptor) {
    return this.assetActions.updateEditSession(
      descriptor.id,
      descriptor.data,
      descriptor.hasChanges);
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
  closeTab(session) {
    if (session.status === 'dirty') {
      let dialogRef = openDialog(this.dialog, ChangeLossDecisionViewComponent, {
        data: {
          asset: this.assets[session.assetId]
        }
      });
      dialogRef.afterClosed()
        .subscribe(decision => {
          switch (decision) {
            case 'SAVE_CLOSE':
              let prevId = session.id;
              let prev = session;
              // Temporarily turn the main session listener in
              // favour of the save listener.
              this.waitingSaveToClose$.next(true);
              // Ask the handling component to persist the changes
              this.renderedComponent.save();
              // Listing for save status and close afterwards
              this.editSessions$
                .pipe(take(2))
                .subscribe((sessions: EditSessions) => {
                  let next = sessions.byId[prevId];
                  pretty('GREEN',
                    prev,
                    next,
                    prev === next,
                    '$o');
                  if (prev.status === 'saving' && next.status === 'fetched') {
                    this.waitingSaveToClose$.next(false);
                    this.dispatch(
                      this.assetActions.closeEditSession(
                        session,
                        this.assets[session.assetId]));
                  } else {
                    prev = next;
                    this.sessionsChanged(sessions);
                  }
                });
              break;
            case 'DISCARD_CLOSE':
              this.dispatch(
                this.assetActions.closeEditSession(
                  session, this.assets[session.assetId]));
              break;
          }
        });
      return this.selectTab(session);
    } else {
      return this.assetActions.closeEditSession(session, this.assets[session.assetId]);
    }
  }

}

@Component({
  selector: 'std-change-loss-decision',
  template: `
    <h2 i18n>Unsaved Changes</h2>
    <p i18n><i class="orange warning circle icon"></i> {{assetName}} contains unsaved changes. Save changes before
      closing?</p>
    <button class="ui button primary" (click)="aye()">Yes</button>
    <button class="ui red button" (click)="nay()">No</button>
    <button class="ui basic button" (click)="close(null)">Cancel</button>
  `,
  styles: [``]
})
export class ChangeLossDecisionViewComponent implements OnInit {

  assetName: string;

  constructor(public dialogRef: MatDialogRef<ChangeLossDecisionViewComponent>,
              @Inject(MAT_DIALOG_DATA) public data: any) {
  }

  ngOnInit() {
    this.assetName = this.data.asset.label;
  }

  nay(): void {
    this.close('DISCARD_CLOSE');
  }

  aye(): void {
    this.close('SAVE_CLOSE');
  }

  close(decision) {
    this.dialogRef.close(decision);
  }

}
