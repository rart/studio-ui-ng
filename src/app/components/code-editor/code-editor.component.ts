import {
  AfterViewInit,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnChanges, OnDestroy,
  OnInit,
  Output,
  ViewChild
} from '@angular/core';
import { environment } from '../../../environments/environment';
import { Asset } from '../../models/asset.model';
import { ContentService } from '../../services/content.service';
import { CodeEditor } from '../../classes/code-editor.abstract';
import { CodeEditorFactory } from '../../classes/code-editor-factory.class';
import { Subject } from 'rxjs/Subject';
import { combineLatest, map } from 'rxjs/operators';

// TODO: how to avoid navigation when code has been entered and not saved? — also, is auto save viable?

requirejs({
  baseUrl: `${environment.assetsUrl}/js/vendor`,
  paths: {
    'vs': `${environment.assetsUrl}/js/vendor/vs`,
    'ace': `${environment.assetsUrl}/js/vendor/ace`
  }
});

@Component({
  selector: 'std-code-editor',
  template: `
    <div class="loader take-over" *ngIf="!libsFetchComplete">
      <div class="wrapper">
        <mat-spinner></mat-spinner>
        <div class="info">Loading Editor...</div>
      </div>
    </div>
    <div class="code-editor" #editor></div>`,
  styles: [`
    :host {
      width: 100%;
      height: 100%;
    }
    .code-editor {
      width: 100%;
      height: 100%;
    }
  `]
})
export class CodeEditorComponent implements OnInit, OnChanges, OnDestroy, AfterViewInit {

  @ViewChild('editor') editorRef: ElementRef;

  @Input() asset: Asset;
  @Input() editable = false;
  @Input() value = 'Loading Content...';

  @Output() valueChanged = new EventEmitter();

  libsFetchComplete = false;

  private lastFileFetched = null;
  private contentFetchSub = null;
  private codeEditorChoice = null;
  private $editorInitialized = new Subject<any>();

  // vendor: 'ace' | 'monaco' = 'ace';

  private editor: CodeEditor;

  get elem() {
    return this.editorRef ? this.editorRef.nativeElement : null;
  }

  constructor(private contentService: ContentService) {

  }

  ngOnInit() {

  }

  ngAfterViewInit() {
    this.createEditor();
  }

  ngOnChanges() {
    let { asset } = this;
    if (!asset) {
      this.value = '';
      this.editable = true;
      return;
    }
    if (this.editor) {
      this.editor.value('Loading...');
      this.editor.option('editable', false);
    }
    if (this.lastFileFetched !== `${asset.siteCode}:${asset.id}`) {
      this.lastFileFetched = `${asset.siteCode}:${asset.id}`;
      if (this.contentFetchSub) {
        this.contentFetchSub.unsubscribe();
      }
      let shouldReplaceEditor =
        (this.codeEditorChoice !== null) &&
        (this.codeEditorChoice !== CodeEditorFactory.choice(this.asset));
      if (shouldReplaceEditor) {
        this.createEditor();
      }
      let $contentRequest = this.contentService
        .content(asset.siteCode, asset.id);
      this.contentFetchSub = ((this.editor && !shouldReplaceEditor)
        ? $contentRequest.pipe(
          map(data => data.content)
        )
        : $contentRequest.pipe(
          combineLatest(this.$editorInitialized, (data, editor) => data.content)
        )).subscribe(content => {
        this.value = content;
        this.editor.value(content);
        this.editor.option('editable', this.editable);
        if (this.contentFetchSub) {
          this.contentFetchSub.unsubscribe();
        }
      });
    }
  }

  ngOnDestroy() {
    this.editor.dispose();
    this.$editorInitialized.complete();
  }

  createEditor() {
    if (this.editor) {
      this.editor.dispose();
      this.libsFetchComplete = false;
    }
    let editor = CodeEditorFactory.create(this.asset);
    this.codeEditorChoice = editor.vendor;
    editor
      .render(this.elem, this.getOptions())
      .then(() => {
        this.libsFetchComplete = true;
        this.$editorInitialized.next(editor);
      });
    editor.subscribe((e) => this.valueChanged.next(e));
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
    let { value, asset, editable } = this;
    return {
      emmet: true,
      editable: editable,
      lang: asset.type,
      value: value
    };
  }

}
