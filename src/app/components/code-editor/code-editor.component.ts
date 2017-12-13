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
import { CodeEditor } from '../../classes/code-editor.abstract';
import { CodeEditorFactory } from '../../classes/code-editor-factory.class';
import { Subject } from 'rxjs/Subject';
import { combineLatest, map, takeUntil } from 'rxjs/operators';
import { CommunicationService } from '../../services/communication.service';

// TODO: how to avoid navigation when code has been entered and not saved? — also, is auto save viable?

@Component({
  selector: 'std-code-editor',
  templateUrl: 'code-editor.component.html',
  styleUrls: ['code-editor.component.scss']
})
export class CodeEditorComponent implements OnInit, OnChanges, OnDestroy, AfterViewInit {

  @ViewChild('editor') editorRef: ElementRef;

  @Input() asset: Asset;
  @HostBinding('class.editable')
  @Input() editable = false;
  @Input() value = 'Loading Content...';

  @Output() valueChanged = new EventEmitter();
  @Output() editCancelled = new EventEmitter();

  libsFetchComplete = false;

  private lastFileFetched = null;
  private contentFetchSub = null;
  private $editorInitialized = new Subject<any>();

  // vendor: 'ace' | 'monaco' = 'ace';

  private editor: CodeEditor;
  private unSubscriber = new Subject();

  get elem() {
    return this.editorRef ? this.editorRef.nativeElement : null;
  }

  constructor(private contentService: ContentService,
              private communicationService: CommunicationService) {

  }

  ngOnInit() {
    this.communicationService.resize((e) => {
      if (this.editor && this.editor.vendor === 'monaco') {
        this.editor.resize();
      }
    }, takeUntil(this.unSubscriber));
  }

  ngAfterViewInit() {
    this.createEditor();
  }

  ngOnChanges() {
    let { asset } = this;
    // if (!asset) {
    //   this.value = '';
    //   this.editable = true;
    //   return;
    // }
    if (this.editor) {
      this.editor.option('editable', this.editable);
      // setTimeout(() => this.editor.resize());
      setTimeout(() => this.editable && this.editor.focus());
    }
    if (this.lastFileFetched !== `${asset.siteCode}:${asset.id}`) {
      this.lastFileFetched = `${asset.siteCode}:${asset.id}`;
      if (this.contentFetchSub) {
        this.contentFetchSub.unsubscribe();
      }
      let shouldReplaceEditor =
        (this.editor) &&
        (this.editor.vendor !== null) &&
        (this.editor.vendor !== CodeEditorFactory.choice(this.asset));
      if (shouldReplaceEditor) {
        this.createEditor();
      } else if (this.editor) {
        this.editor.value('Loading...');
        this.editor.option('editable', false);
      }
      let contentRequest$ = this.contentService
        .content(asset.siteCode, asset.id);
      this.contentFetchSub = ((this.editor && !shouldReplaceEditor)
        ? contentRequest$.pipe(
          map(data => data.content)
        )
        : contentRequest$.pipe(
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
    this.unSubscriber.next();
    this.unSubscriber.complete();
    this.$editorInitialized.complete();
  }

  createEditor() {
    if (this.editor) {
      this.editor.dispose();
      this.libsFetchComplete = false;
    }
    let editor = CodeEditorFactory.create(this.asset);
    editor
      .render(this.elem, this.getOptions())
      .then(() => {
        this.libsFetchComplete = true;
        this.$editorInitialized.next(editor);
        this.editable && this.editor.focus();
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

  cancel() {
    this.editor.value()
      .then((value) => this.editCancelled.next({
        value: value
      }));
  }

  save() {

  }

}
