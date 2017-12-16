import {
  AfterViewInit,
  Component,
  ElementRef,
  EventEmitter, HostBinding,
  Input,
  OnChanges, OnDestroy,
  OnInit,
  Output,
  ViewChild
} from '@angular/core';
import { environment } from '../../../environments/environment';
import { Asset } from '../../models/asset.model';
import { ContentService } from '../../services/content.service';
import { CodeEditor, CodeEditorChange, CodeEditorChoiceEnum } from '../../classes/code-editor.abstract';
import { CodeEditorFactory } from '../../classes/code-editor-factory.class';
import { Subject } from 'rxjs/Subject';
import { combineLatest, map, switchMap, take, takeUntil, takeWhile } from 'rxjs/operators';
import { CommunicationService } from '../../services/communication.service';
import { WithNgRedux } from '../../classes/with-ng-redux.class';
import { AppState, EditSession, EditSessions, LookUpTable } from '../../classes/app-state.interface';
import { NgRedux, select } from '@angular-redux/store';
import { Observable } from 'rxjs/Observable';
import { isNullOrUndefined } from 'util';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';

// TODO: how to avoid navigation when code has been entered and not saved? — also, is auto save viable?

@Component({
  selector: 'std-code-editor',
  templateUrl: 'code-editor.component.html',
  styleUrls: ['code-editor.component.scss']
})
export class CodeEditorComponent extends WithNgRedux implements OnInit, OnChanges, OnDestroy, AfterViewInit {

  @Input() vendor = CodeEditorChoiceEnum.MONACO;
  @Input() lang;

  @Output() changes$ = new Subject<CodeEditorChange>();
  @Output() value$ = new Subject<string>();
  @Output() initialized$ = new BehaviorSubject(false);

  @ViewChild('editor') private elementRef: ElementRef;

  private _editable = true; // for editable (get/set)
  private _value = ''; // for value (get/set)
  private editor: CodeEditor;

  private ngOnChanges$ = new Subject();

  get elem() {
    return this.elementRef ? this.elementRef.nativeElement : null;
  }

  constructor(store: NgRedux<AppState>,
              private communicationService: CommunicationService) {
    super(store);
  }

  ngOnInit() {
    this.addTearDown(() => {
      this.editor.dispose();
      this.changes$.complete();
      this.value$.complete();
      this.initialized$.complete();
      this.ngOnChanges$.complete();
    });
    let { unSubscriber$, ngOnChanges$, communicationService } = this;
    ngOnChanges$
      .subscribe(() => this.onChanges());
    communicationService.resize((e) => {
      let editor = this.editor;
      if (editor && editor.vendor === 'monaco') {
        editor.resize();
      }
    }, takeUntil(unSubscriber$));
  }

  ngAfterViewInit() {
    this.ngOnChanges$.next();
  }

  ngOnChanges() {
    this.ngOnChanges$.next();
  }

  onChanges() {

    let {
      editor,
      vendor,
      editable
    } = this;

    if (!editor || vendor !== editor.vendor) {
      this.createEditor();
    } else if (editor) {
      editor.ready(() => {
        this.configure();
        // setTimeout(() => editor.resize());
        // setTimeout(() => editable && editor.focus());
      });
    }

  }

  createEditor() {
    if (this.editor) {
      this.editor.dispose();
      this.initialized$.next(false);
    }
    let editor = CodeEditorFactory.create(this.vendor);
    editor
      .render(this.elem, this.getOptions())
      .then(() => {
        this.initialized$.next(true);
        this.editable && this.editor.focus();
      });
    editor.subscribe((e: CodeEditorChange) => {
      this._value = e.value;
      this.value$.next(e.value);
      this.changes$.next(e);
    });
    this.editor = editor;
    return editor;
  }

  configure() {
    let { editor } = this;
    if (editor) {
      editor.options(this.getOptions());
    }
  }

  getOptions() {
    let { value, editable, lang } = this;
    return {
      lang: lang,
      emmet: true,
      value: value,
      editable: editable
    };
  }

  @Input()
  set editable(editable) {
    this._editable = editable;
    this.performWhenEditorReady((initialized) => {
      if (initialized) {
        this.editor.option('editable', this._editable);
      }
    });
  }

  get editable() {
    return this._editable;
  }

  @Input()
  set value(value: string) {
    // TODO: review EditorComponent initialization call stack
    // console.log(`set value called with ${value}`);
    value = isNullOrUndefined(value) ? '' : value;
    this._value = value;
    this.performWhenEditorReady((initialized) => {
      if (initialized) {
        this.editor.value(this._value);
      }
    });
  }

  get value() {
    return this._value;
  }

  performWhenEditorReady(logic) {
    this.initialized$
      .pipe(
        switchMap((initialized) => {
          if (initialized) {
            return Observable.of(true);
          } else {
            return Observable.never();
          }
        }),
        take(1)
      )
      .subscribe(logic);
  }

  focus() {
    this.editor.focus();
  }

  resize() {
    this.editor.resize();
  }
}
