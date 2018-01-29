import { AfterViewInit, Component, Inject, OnInit, QueryList, ViewChildren } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/forkJoin';
import { AppState, EditSession, EditSessions, LookupTable } from '../../classes/app-state.interface';
import { dispatch, NgRedux, select } from '@angular-redux/store';
import { WithNgRedux } from '../../classes/with-ng-redux.class';
import { Asset } from '../../models/asset.model';
import { filter, skip, switchMap, take, takeUntil } from 'rxjs/operators';
import { AssetActions } from '../../actions/asset.actions';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { notNullOrUndefined } from '../../app.utils';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material';
import { openDialog } from '../../utils/material.utils';
import { EditorComponent } from '../editor/editor.component';
import { Subject } from 'rxjs/Subject';
import { AssetTypeEnum } from '../../enums/asset-type.enum';
import { PluginHostComponent } from '../plugin-host/plugin-host.component';
import { isNullOrUndefined } from 'util';

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
  assets$: Observable<LookupTable<Asset>>;

  sessionAssetsHaveLoaded$ = new BehaviorSubject(false);

  assets: LookupTable<Asset>;
  active: EditSession;
  sessions: EditSession[] = [];

  renderer: string;
  renderedComponent: { save: () => void, diff: () => void };

  waitingSaveToClose$ = new BehaviorSubject(false);

  constructor(store: NgRedux<AppState>,
              private assetActions: AssetActions,
              public dialog: MatDialog) {
    super(store);
  }

  ngOnInit() {

    let { editSessions$, assets$, waitingSaveToClose$ } = this;

    this.pipeFilterAndTakeUntil(assets$)
      .subscribe(x => this.assets = x);

    waitingSaveToClose$
      .pipe(
        // Only pass when NOT waiting on save before closing
        filter(x => !x),
        // waitingSaveToClose$ triggers the subscription into editSessions$
        // which updates whenever sessions are updated
        switchMap(() =>
          editSessions$.pipe(
            takeUntil(
              // Since it's a behaviour subject, it will emit immediately
              // causing editSessions$ to stop emitting, so we skip the first
              waitingSaveToClose$.pipe(skip(1))
            ))),
        this.untilDestroyed()
      )
      .subscribe((sessions: EditSessions) => {
        this.sessionsChanged(sessions);
      });

    // Make sure all the assets are loaded
    this.pipeFilterAndTakeUntil(editSessions$, take(1))
      .subscribe((sessions: EditSessions) => {

        let query = [];
        let observables = [];
        let terminator = new Subject();

        Object.values(sessions.byId)
          .forEach(session => {
            query.push({ projectCode: session.projectCode, assetId: session.assetId });
            observables.push(
              this.select(['entities', 'assets', 'byId', session.assetId])
                .pipe(
                  filter(a => notNullOrUndefined(a)),
                  take(1))
            );
          });

        // Find if any of these are already loaded and get them
        // out of the list assets to merge
        Observable
          .merge(...observables)
          .pipe(takeUntil(terminator))
          .subscribe((asset: Asset) => {
            query = query.filter(dataMap =>
              asset.id !== dataMap.assetId ||
              asset.projectCode !== dataMap.projectCode);
          });

        if (query.length) {
          // Only fetch the items that aren't already loaded
          terminator.next();
          terminator.complete();
          Observable
            .forkJoin(observables)
            .subscribe(assets => {
              this.assets = assets.reduce((oMap: any, asset: Asset) => {
                oMap[asset.id] = asset;
                return oMap;
              }, {});
              this.sessionAssetsHaveLoaded$.next(true);
            });
        } else {
          this.sessionAssetsHaveLoaded$.next(true);
        }

        // First time load, reqs might not have been met but navigating away and back
        // they would be met. The above fork of observables would determine that by firing
        // sessionAssetsHaveLoaded$ synchronously instead of async.
        this.sessionAssetsHaveLoaded$
          .pipe(take(1))
          .subscribe((met) => {
            if (!met) {
              this.dispatch(this.assetActions.fetchSome(query));
            }
          });

      });

    this.addTearDown(() => {
      this.sessionAssetsHaveLoaded$.complete();
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

  assetChanged(assetId) {
    if (isNullOrUndefined(assetId)) {
      this.renderer = 'none';
    } else {
      this.renderer = 'determining';
      this.select<Asset>(['entities', 'assets', 'byId', assetId])
        .pipe(
          filter(x => notNullOrUndefined(x)),
          take(1))
        .subscribe((asset) => {
          switch (asset.type) {
            case AssetTypeEnum.PAGE:
              this.renderer = 'PluginHostComponent';
              break;
            default:
              this.renderer = 'CodeEditorComponent';
          }
        });
    }
  }

  sessionsChanged(sessions: EditSessions) {
    this.sessions = sessions.order.map(sid => sessions.byId[sid]);
    if (notNullOrUndefined(sessions.activeId)) {
      let nextActive = sessions.byId[sessions.activeId];
      let prevActive = this.active || {} as any;
      if (prevActive.assetId !== nextActive.assetId) {
        this.assetChanged(nextActive.assetId);
      }
      this.active = nextActive;
    } else {
      this.active = null;
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
            case 'REVIEW':
              this.renderedComponent.diff();
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

  @dispatch()
  foo() {
    return { type: 'NOOP' };
  }

}

@Component({
  selector: 'std-change-loss-decision',
  template: `
    <h2 translate>Unsaved Changes</h2>
    <p translate><i class="orange warning circle icon"></i> {{assetName}} contains unsaved changes. Save changes before
      closing?</p>
    <button class="ui button primary" (click)="aye()">Yes</button>
    <button class="ui red button" (click)="nay()">No</button>
    <button class="ui button" (click)="review()">Review</button>
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

  review(): void {
    this.close('REVIEW');
  }

  close(decision) {
    this.dialogRef.close(decision);
  }

}
