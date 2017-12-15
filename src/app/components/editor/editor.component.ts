import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  OnChanges,
  OnDestroy,
  OnInit, Output, QueryList, ViewChild, ViewChildren
} from '@angular/core';
import { Asset } from '../../models/asset.model';
import { CodeEditorChoiceEnum } from '../../classes/code-editor.abstract';
import { CodeEditorFactory } from '../../classes/code-editor-factory.class';
import {
  combineLatest, debounceTime, distinctUntilChanged, filter, skip, take, takeUntil, tap,
  withLatestFrom
} from 'rxjs/operators';
import { WithNgRedux } from '../../classes/with-ng-redux.class';
import { AppState, EditSession, EditSessions, LookUpTable } from '../../classes/app-state.interface';
import { dispatch, NgRedux, select } from '@angular-redux/store';
import { Observable } from 'rxjs/Observable';
import { isNull, isNullOrUndefined } from 'util';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { AssetActions } from '../../actions/asset.actions';
import { CodeEditorComponent } from '../code-editor/code-editor.component';
import { Subject } from 'rxjs/Subject';

// TODO: how to avoid navigation when code has been entered and not saved? — also, is auto save viable?

@Component({
  selector: 'std-editor',
  templateUrl: 'editor.component.html',
  styleUrls: ['editor.component.scss']
})
export class EditorComponent extends WithNgRedux implements OnChanges, OnInit, AfterViewInit, OnDestroy {

  @ViewChild(CodeEditorComponent) codeEditor: CodeEditorComponent;
  @ViewChildren(CodeEditorComponent) codeEditorQL: QueryList<CodeEditorComponent>;
  // The code editor has been attached to the document and angular has picked it up
  private codeEditorReady$ = new BehaviorSubject<boolean>(false);

  @select(['editSessions'])
  private sessions$: Observable<EditSessions>;

  @select(['editSessions', 'activeId'])
  private sessionId$: Observable<string>;

  @Output() data$ = new Subject();
  value$ = new Subject();

  asset: Asset;
  content = '';
  // Active edit session
  session: EditSession;
  // The current vendor in use (ace or monaco)
  vendor: CodeEditorChoiceEnum = CodeEditorChoiceEnum.MONACO;

  sessionChanged$ = new Subject();
  // sessionChanged$ = new BehaviorSubject(null);

  // session
  sessionLoaded$ = new BehaviorSubject(false);
  // content
  contentLoaded$ = new BehaviorSubject(false);
  // asset
  assetLoaded$ = new BehaviorSubject(false);
  // The code editor libs (monaco/ace) have finished loading successfully.
  editorLibsLoaded$ = new BehaviorSubject(false);
  // compile
  loading$ = this.sessionLoaded$
    .pipe(
      combineLatest(
        this.sessionLoaded$,
        this.contentLoaded$,
        this.assetLoaded$,
        this.editorLibsLoaded$,
        (sessionLoaded$,
         contentLoaded$,
         assetLoaded$,
         editorLibsLoaded$) => {
          return !(
            sessionLoaded$ &&
            contentLoaded$ &&
            assetLoaded$ &&
            editorLibsLoaded$
          );
        }
      )
    );

  data = { content: '' };

  constructor(store: NgRedux<AppState>,
              private actions: AssetActions) {
    super(store);
  }

  ngOnInit() {

    this.addTearDown(() => {
      this.data$.complete();
      this.value$.complete();
      this.editorLibsLoaded$.complete();
      this.sessionChanged$.complete();
    });

    let { sessions$, sessionId$, unSubscriber$, value$, codeEditorQL } = this;

    sessionId$
      .pipe(
        filter(x => !isNullOrUndefined(x)),
        distinctUntilChanged(),
        withLatestFrom(sessions$, (id, container) => {
          return container.byId[id];
        }),
        takeUntil(unSubscriber$)
      )
      .subscribe((session) => {
        this.sessionChanged(session);
        this.sessionLoaded$.next(true);
        this.sessionChanged$.next(session);
        this.subscribeToSession(session.id);
        this.subscribeToAsset(session.assetId);
      });

    value$
      .pipe(
        debounceTime(500),
        distinctUntilChanged()
      )
      .subscribe(value => this.contentChanged(value));

  }

  ngAfterViewInit() {
    this.codeEditorQL
      .changes
      .pipe(take(1))
      .subscribe(() => {
        this.codeEditorReady$.next(true);
      });
  }

  contentChanged(value) {
    let { data } = this;
    data.content = value;
    this.data$.next({ id: this.session.id, data });
  }

  ngOnChanges() {
    pretty('GREEN', 'EditorComponent.ngOnChanges()');
  }

  subscribeToAsset(assetId) {
    let assetReady = false;
    this.select(['entities', 'assets', 'byId', assetId])
      .pipe(
        filter(x => !isNullOrUndefined(x)),
        takeUntil(this.sessionChanged$)
      )
      .subscribe((asset: Asset) => {
        assetReady = true;
        this.assetChanged(asset);
        this.assetLoaded$.next(true);
      });
    if (!assetReady) {
      this.assetLoaded$.next(false);
    }
  }

  subscribeToSession(activeId) {
    this.select(['editSessions', 'byId', activeId])
      .pipe(
        // When a session is closed, this active ID will
        // be deleted and this observable will yield undefined
        // as the new value. So filter that out...
        filter(x => !isNullOrUndefined(x)),
        distinctUntilChanged((prev: EditSession, next: EditSession) => {
          return ((prev.status === next.status) &&
            (prev.fetchPayload === next.fetchPayload));
        }),
        takeUntil(this.sessionChanged$)
      )
      .subscribe((session: EditSession) => {
        this.sessionUpdated(session);
      });
  }

  fetchAsset() {
    let { actions, session } = this;
    this.dispatch(
      actions.fetchForEdit(
        session.id,
        session.projectCode,
        session.assetId));
  }

  assetChanged(asset: Asset) {
    this.asset = asset;
    this.vendor = CodeEditorFactory.choice(asset);
  }

  sessionChanged(next: EditSession) {

    this.session = { ...next };
    if (next.data) {
      this.session.data = { ...next.data };
    }

    setTimeout(_ => {
      // When switching editor vendors, the Session is
      // changed/updated before the editor component had
      // a chance to switch and re-render. When going from
      // ace in to monaco, this caused an error due to value
      // trying to be set when the Editor class subjects had
      // already been disposed.
      if (isNullOrUndefined(next.data)) {
        this.content = next.fetchPayload || '';
      } else {
        this.content = next.data.content;
      }
    });

    if (next.status === 'void') {
      this.contentLoaded$.next(false);
      this.fetchAsset();
    }

  }

  sessionUpdated(updated: EditSession) {

    let prev = this.session;

    this.session = {
      ...this.session,
      status: updated.status,
      fetchPayload: updated.fetchPayload
    };

    if (prev.status === 'fetching' && updated.status === 'fetched') {
      this.contentLoaded$.next(true);
      this.content = <string>updated.fetchPayload;
    } else if (updated.status === 'closing') {
      this.contentLoaded$.next(false);
    }

  }

  revert() {
    let { codeEditor, session, data$ } = this;
    codeEditor.focus();
    codeEditor.value = session.fetchPayload;
    data$.next({ id: session.id, data: session.fetchPayload });
  }

  @dispatch()
  save() {
    return this.actions.persistSessionChanges(
      this.asset,
      this.session,
      this.data.content);
  }

}
