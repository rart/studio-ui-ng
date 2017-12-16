import {
  AfterViewInit,
  Component,
  ElementRef,
  OnChanges,
  OnDestroy,
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
import { WindowMessageTopicEnum } from '../../enums/window-message-topic.enum';
import { notNullOrUndefined } from '../../app.utils';

const COOKIE = environment.preview.cookie;

// TODO: how to avoid navigation when code has been entered and not saved? — also, is auto save viable?

@Component({
  selector: 'std-editor',
  templateUrl: 'editor.component.html',
  styleUrls: ['editor.component.scss']
})
export class EditorComponent extends WithNgRedux implements OnChanges, OnInit, AfterViewInit, OnDestroy {

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

  sessionChanged$ = new Subject();

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

  data = {
    url: '/',
    split: 'no', // 'no' | 'vertical' | 'horizontal'
    content: '',
    hasChanges: false
  };

  get classes() {
    return `${this.data.split} split container`;
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
    });

    let { sessions$, sessionId$, unSubscriber$, value$ } = this;

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

    // this.communicator.subscribeTo(
    //   WindowMessageTopicEnum.GUEST_CHECK_IN,
    //   (message) => {
    //     if (this.data.url !== message.data.url) {
    //       this.data.url = message.data.url;
    //       this.onDataChange();
    //     }
    //   }, /* any scope */undefined,
    //   this.endWhenDestroyed);

    this.communicator.resize(() => {
      this.split(true);
    }, this.endWhenDestroyed);

  }

  ngAfterViewInit() {
    this.codeEditorQL
      .changes
      .pipe(take(1))
      .subscribe(() => {
        this.codeEditorComponentReady$.next(true);
      });
  }

  contentChanged(value) {
    let { data } = this;
    data.content = value;
    data.hasChanges = true;
    this.onDataChange();
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
    // If the asset was loaded, the select above would call
    // the subscriber synchronously
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
      // noinspection TsLint
      if (isNullOrUndefined(next.data)) {
        // noinspection TsLint
        if (notNullOrUndefined(next.fetchPayload)) {
          this.content = next.fetchPayload;
        }
      } else {
        this.content = next.data.content;
      }
      // if (isNullOrUndefined(next.data)) {
      //   this.content = next.fetchPayload || '';
      // } else {
      //   this.content = next.data.content;
      // }
    });

    if (next.status === 'void') {
      this.contentLoaded$.next(false);
      this.fetchAsset();
    }

    // On first session setting, codeEditor may be undefined
    if (notNullOrUndefined(this.codeEditor)) {
      // When closing a tab editable is set to false.
      // After close and session change, reset to editable = true
      this.codeEditor.editable = true;
    }

  }

  sessionUpdated(updated: EditSession) {

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
      if (this.iFrame) {
        this.iFrame.reload();
      }
    } else if (updated.status === 'closing') {
      this.codeEditor.editable = false;
    }

  }

  split(recalc = false) {
    let
      { data } = this,
      view = data.split;
    if (view === 'no' && recalc) {
      return;
    }
    if (view !== 'no' && !recalc) {
      data.split = 'no';
    } else {
      if (view === 'no') {
        this.iFrameQL
          .changes
          .pipe(take(1))
          .subscribe((ql) => {
            this.iFrame.navigate(this.data.url);
          });
      }
      let $elem = $(this.elementRef.nativeElement);
      data.split = $elem.width() > $elem.height() ? 'vertical' : 'horizontal';
    }
    this.onDataChange();
    // Give angular's change detector a chance to
    // update before resizing the editor.
    setTimeout(() => this.codeEditor.resize());
  }

  beforeIFrameNav() {
    let asset = this.asset;
    if (asset.projectCode) {
      this.cookieService.set(COOKIE, asset.projectCode, null, '/');
    }
  }

  onDataChange() {
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
    data.content = '';
    this.onDataChange();
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
