import {
  AfterViewInit,
  Component,
  ElementRef,
  OnInit,
  Output,
  QueryList,
  ViewChild,
  ViewChildren
} from '@angular/core';
import {
  debounceTime,
  distinctUntilChanged,
  filter,
  map,
  take,
  takeUntil,
  withLatestFrom
} from 'rxjs/operators';
import 'rxjs/add/observable/combineLatest';
import { dispatch, NgRedux, select } from '@angular-redux/store';

import { Asset } from '../../models/asset.model';
import { CodeEditorChoiceEnum } from '../../classes/code-editor.abstract';
import { CodeEditorFactory } from '../../classes/code-editor-factory.class';
import { WithNgRedux } from '../../classes/with-ng-redux.class';
import { AppState, EditSession, EditSessions } from '../../classes/app-state.interface';

import { Observable } from 'rxjs/Observable';
import { isNullOrUndefined } from 'util';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { AssetActions } from '../../actions/asset.actions';
import { CodeEditorComponent } from '../code-editor/code-editor.component';
import { Subject } from 'rxjs/Subject';
import { IFrameComponent } from '../iframe/iframe.component';
import { environment } from '../../../environments/environment';
import { CookieService } from 'ngx-cookie-service';
import { CommunicationService } from '../../services/communication.service';
import { notNullOrUndefined } from '../../app.utils';
import { WindowMessageTopicEnum } from '../../enums/window-message-topic.enum';

const COOKIE = environment.preview.cookie;

// TODO: how to avoid navigation when code has been entered and not saved? — also, is auto save viable?
// https://angular.io/guide/lifecycle-hooks

const DEFAULT_DATA = {
  url: '/',
  split: 'no', // 'no' | 'vertical' | 'horizontal'
  diff: false,
  content: null,
  hasChanges: false
};

@Component({
  selector: 'std-editor',
  templateUrl: 'editor.component.html',
  styleUrls: ['editor.component.scss']
})
export class EditorComponent extends WithNgRedux implements OnInit, AfterViewInit {

  @ViewChild(IFrameComponent) iFrame: IFrameComponent;
  @ViewChildren(IFrameComponent) iFrameQL: QueryList<IFrameComponent>;
  @ViewChild(CodeEditorComponent) codeEditor: CodeEditorComponent;
  @ViewChildren(CodeEditorComponent) codeEditorQL: QueryList<CodeEditorComponent>;
  // The code editor has been attached to the document and angular has picked it up
  private codeEditorComponentReady$ = new BehaviorSubject<boolean>(false);

  @select(['editSessions'])
  private sessions$: Observable<EditSessions>;

  @select(['editSessions', 'activeId'])
  private sessionId$: Observable<string>;

  @Output() data$ = new Subject();
  value$ = new Subject();

  asset: Asset;
  content;
  // Active edit session
  session: EditSession;
  // The current vendor in use (ace or monaco)
  vendor: CodeEditorChoiceEnum = CodeEditorChoiceEnum.MONACO;

  diffOriginal;
  diffModified;

  sessionChanged$ = new Subject();

  hasIFrame$ = new BehaviorSubject(false);

  // session
  sessionLoaded$ = new BehaviorSubject(false);
  // content
  contentLoaded$ = new BehaviorSubject(false);
  // asset
  assetLoaded$ = new BehaviorSubject(false);
  // The code editor libs (monaco/ace) have finished loading successfully.
  editorLibsLoaded$ = new BehaviorSubject(false);
  // compile
  loading$ = Observable.combineLatest(
    this.sessionLoaded$,
    this.contentLoaded$,
    this.assetLoaded$,
    this.editorLibsLoaded$,
    (sessionLoaded$,
     contentLoaded$,
     assetLoaded$,
     editorLibsLoaded$) => {
      // pretty('TEAL',
      //   `sessionLoaded$ ${sessionLoaded$}`,
      //   `contentLoaded$ ${contentLoaded$}`,
      //   `assetLoaded$ ${assetLoaded$}`,
      //   `editorLibsLoaded$ ${editorLibsLoaded$}`);
      return !(
        sessionLoaded$ &&
        contentLoaded$ &&
        assetLoaded$ &&
        editorLibsLoaded$
      );
    }
  ).pipe(
    // debouncing seems to help angular's change detector to be in sync
    // and not get lost when loading fires too may times too close
    // ("ExpressionChangedAfterItHasBeenCheckedError")
    debounceTime(300)
  );

  data = { ...DEFAULT_DATA };

  get classes() {
    let split = this.data.diff ? 'no' : this.data.split;
    return `${split} split container`;
  }

  constructor(store: NgRedux<AppState>,
              private actions: AssetActions,
              private elementRef: ElementRef,
              private cookieService: CookieService,
              private communicator: CommunicationService) {
    super(store);
  }

  ngOnInit() {

    this.addTearDown(() => {
      this.data$.complete();
      this.value$.complete();
      this.editorLibsLoaded$.complete();
      this.sessionChanged$.complete();
      this.hasIFrame$.complete();
    });

    let { sessions$, sessionId$, value$ } = this;

    sessionId$
      .pipe(
        filter(x => !isNullOrUndefined(x)),
        distinctUntilChanged(),
        withLatestFrom(sessions$, (id, container) => {
          return container.byId[id];
        }),
        this.untilDestroyed()
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

    this.communicator.subscribeTo(
      WindowMessageTopicEnum.GUEST_CHECK_IN,
      (message) => {
        if (this.data.url !== message.data.url) {
          this.data.url = message.data.url;
          this.emitData();
        }
      }, /* any scope */undefined,
      this.untilDestroyed());

    this.communicator.resize(() => {
      this.recalculateSplit();
    }, this.untilDestroyed());

  }

  ngAfterViewInit() {

    this.codeEditorQL
      .changes
      .pipe(take(1))
      .subscribe(() => {
        this.codeEditorComponentReady$.next(true);
      });

    this.iFrameQL
      .changes
      .pipe(
        // The QL changes internally but it is always a reference to the same object
        map(ql => ({ length: ql.length })),
        // If not mapped above this comparison would ALWAYS return true
        // despite it having changed internally — in this case the length
        distinctUntilChanged((prevQL, nextQL) => prevQL.length === nextQL.length),
        this.untilDestroyed()
      )
      .subscribe(ql => {
        this.hasIFrame$.next(ql.length > 0);
      });

    if (this.iFrame) {
      // Angular QL.changes behaves somehow different on first run
      // than subsequent initializations and hence the above doesn't
      // work as intended. This is a fallback for it.
      // When the component is first instanced and the state dictates
      // that there's an iFrame, the .changes triggers. On subsequent
      // initializations the .changes doesn't trigger despite the iFrame
      // being present.
      this.hasIFrame$
        .pipe(take(1))
        .subscribe(has => !has && (this.hasIFrame$.next(true)));
    }

  }

  private contentChanged(value) {
    let { data } = this;
    data.content = value;
    data.hasChanges = true;
    this.emitData();
  }

  private subscribeToAsset(assetId) {
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
    // If the asset was loaded, the select above would call
    // the subscriber synchronously
    if (!assetReady) {
      this.assetLoaded$.next(false);
    }
  }

  private subscribeToSession(activeId) {
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

  private fetchAsset() {
    let { actions, session } = this;
    this.dispatch(
      actions.fetchForEdit(
        session.id,
        session.projectCode,
        session.assetId));
  }

  private assetChanged(asset: Asset) {
    this.asset = asset;
    this.vendor = CodeEditorFactory.choice(asset);
  }

  private sessionChanged(next: EditSession) {

    let prev = this.session;
    let prevData = this.data;
    let nextData = notNullOrUndefined(next.data)
      ? { ...DEFAULT_DATA, ...next.data }
      : { ...DEFAULT_DATA };

    this.session = { ...next };
    this.data = nextData;

    if (prevData.split !== nextData.split) {
      this.split(
        (nextData.split !== 'no')
          ? this.calcBestSplitFit()
          : 'no');
    }

    if (
      (isNullOrUndefined(prev) && nextData.split !== 'no') ||
      (prevData.url !== nextData.url) ||
      (prevData.split === 'no' && nextData.split !== 'no')
    ) {
      this.navigatePreview();
    }

    setTimeout(_ => {
      // When switching editor vendors, the Session is
      // changed/updated before the editor component had
      // a chance to switch and re-render. When going from
      // ace in to monaco, this caused an error due to value
      // trying to be set when the Editor class subjects had
      // already been disposed.
      // noinspection TsLint
      if (isNullOrUndefined(next.data) || isNullOrUndefined(next.data.content)) {
        // noinspection TsLint
        if (notNullOrUndefined(next.fetchPayload)) {
          this.content = next.fetchPayload;
          this.contentLoaded$.next(true);
        }
      } else {
        this.content = next.data.content;
        this.contentLoaded$.next(true);
      }
    });

    if (next.status === 'void') {
      this.contentLoaded$.next(false);
      this.fetchAsset();
    } else if (next.status === 'dirty') {
      this.data.hasChanges = true;
    }

    // On first session setting, codeEditor may be undefined
    if (notNullOrUndefined(this.codeEditor)) {
      // When closing a tab editable is set to false.
      // After close and session change, reset to editable = true
      this.codeEditor.editable = true;
    }

  }

  private sessionUpdated(updated: EditSession) {

    let prev = this.session;

    this.session = {
      ...this.session,
      status: updated.status,
      fetchPayload: updated.fetchPayload,
      data: { ...updated.data }
    };

    if (prev.status === 'fetching' && updated.status === 'fetched') {
      this.contentLoaded$.next(true);
      this.content = <string>updated.fetchPayload;
    } else if (prev.status === 'saving' && updated.status === 'fetched') {
      this.data.hasChanges = false;
      this.data.content = null;
      if (this.iFrame) {
        this.iFrame.reload();
      }
    } else if (updated.status === 'closing') {
      this.codeEditor.editable = false;
    }

  }

  private calcBestSplitFit() {
    let $elem = $(this.elementRef.nativeElement);
    return $elem.width() > $elem.height() ? 'vertical' : 'horizontal';
  }

  private recalculateSplit() {
    let current = this.data.split;
    if (current !== 'no') {
      let next = this.calcBestSplitFit();
      if (current !== next) {
        this.split(next);
      }
    }
  }

  toggleSplit() {
    let { data } = this, view = data.split;
    if (view !== 'no') {
      this.split('no');
    } else {
      this.split(this.calcBestSplitFit());
    }
  }

  private split(kind) {
    let
      { data } = this,
      split = data.split;
    if (kind === 'no') {
      data.split = 'no';
    } else {
      if (split === 'no') {
        this.navigatePreview();
      }
      data.split = kind;
    }
    if (split !== kind) {
      this.emitData();
      // Give angular's change detector a chance to
      // update before resizing the editor.
      setTimeout(() => this.codeEditor && this.codeEditor.resize());
    }
  }

  diff() {
    let { session, data } = this;
    this.diffOriginal = session.fetchPayload;
    this.diffModified = data ? data.content || '' : '';
    this.vendor = CodeEditorChoiceEnum.MONACO_DIFF;
    if (data.split !== 'no') {
      setTimeout(() => this.codeEditor.resize());
    }
  }

  unDiff() {
    this.diffOriginal = null;
    this.diffModified = null;
    this.vendor = CodeEditorFactory.choice(this.asset);
    if (this.data.split !== 'no') {
      setTimeout(() => this.codeEditor.resize());
    }
  }

  toggleDiff() {
    let { data } = this;
    if (data.hasChanges) {
      (data.diff = !data.diff)
        ? this.diff()
        : this.unDiff();
    }
  }

  private navigatePreview() {
    this.whenIFrameReady(() => {

      this.iFrame.navigate(this.data.url);
    });
  }

  private whenIFrameReady(logic) {
    this.hasIFrame$
      .pipe(
        filter(hasIFrame => hasIFrame),
        take(1)
      )
      .subscribe(logic);
  }

  beforeIFrameNav() {
    let asset = this.asset;
    if (asset.projectCode) {
      this.cookieService.set(COOKIE, asset.projectCode, null, '/');
    }
  }

  private emitData() {
    this.data$.next({
      id: this.session.id,
      data: this.data,
      hasChanges: this.data.hasChanges
    });
  }

  revert() {
    let { codeEditor, session, data } = this;
    codeEditor.focus();
    codeEditor.value = session.fetchPayload;
    data.hasChanges = false;
    data.content = null;
    if (data.diff) {
      this.unDiff();
    }
    this.emitData();
  }

  format() {
    this.codeEditor.format();
  }

  @dispatch()
  save() {
    return this.actions.persistSessionChanges(
      this.asset,
      this.session,
      this.data.content);
  }

}
