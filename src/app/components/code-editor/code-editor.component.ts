import {
  AfterViewInit, Component, ElementRef, EventEmitter, Input, OnChanges, OnInit, Output,
  ViewChild
} from '@angular/core';
import { environment } from '../../../environments/environment';
import { Subject } from 'rxjs/Subject';
import { ReplaySubject } from 'rxjs/ReplaySubject';
import { AssetTypeEnum } from '../../enums/asset-type.enum';
import { Asset } from '../../models/asset.model';
import { combineLatest } from 'rxjs/operators';
import { ContentService } from '../../services/content.service';

requirejs({
  baseUrl: `${environment.assetsUrl}/js/vendor`,
  paths: {
    'vs': `${environment.assetsUrl}/js/vendor/vs`,
    'ace': `${environment.assetsUrl}/js/vendor/ace`
  }
});

interface CodeEditorOptions {
  tabSize: number;
  lang: string;
}

const DEFAULT_OPTIONS = {
  tabSize: 2,
  lang: 'html',
  folding: true,
  wrap: false,
  editable: true,
  fontSize: 14,
  theme: 'light'
};

export abstract class CodeEditor {

  // protected elem: any;
  protected cfg = DEFAULT_OPTIONS;
  protected instance: any;
  protected abstract setters: any;

  protected changes = new Subject<any>();
  protected loaded = new ReplaySubject(1);
  protected rendered = new ReplaySubject(1);
  protected $ready = this.loaded.pipe(combineLatest(this.rendered, (loaded, rendered) => true));
  // protected state = Observable
  //   .merge(this.loaded, this.rendered)
  //   .pipe(
  //     scan(
  //       (state, loadedOrRendered: STARTUP_EVENT) => ({
  //         loaded: state.loaded || loadedOrRendered === 'load',
  //         rendered: state.rendered || loadedOrRendered === 'render'
  //       }),
  //       { loaded: false, rendered: false }
  //     ),
  //     multicast(new ReplaySubject<{ rendered: boolean, loaded: boolean }>(1))
  //   );

  constructor() {
    this.$ready.subscribe({ complete: () => pretty('RED', '$ready completed, baby') });
  }

  static factory(assetOrType: Asset | string): CodeEditor {
    let type = (typeof assetOrType === 'string')
      ? <string>assetOrType
      : (<Asset>assetOrType).type;
    switch (type) {
      case 'monaco':
        return new MonacoEditor();
      case 'ace':
      case AssetTypeEnum.FREEMARKER:
      default:
        return new AceEditor();
    }
  }

  abstract content(nextContent?: string): Promise<string>;

  abstract render(elem, options?): Promise<CodeEditor>;

  private setOption(option: string, value: any) {
    let { setters } = this;
    setters[option](value);
  }

  option(option: string, value?: any) {
    if (value !== undefined) {
      this.cfg[option] = value;
      return this.ready(() => {
        this.setOption(option, value);
      });
    } else {
      return this.cfg[option];
    }
  }

  options(value?: any) {
    if (value !== undefined) {
      let { cfg } = this;
      Object.assign(cfg, value);
      return this.ready(() => {
        Object.keys(cfg).forEach((opt) => this.setOption(opt, cfg[opt]));
      });
    } else {
      return Object.assign({}, this.cfg);
    }
  }

  ready(logic?): Promise<any> {
    return this.$ready
      .toPromise()
      .then(x => (logic && logic(x)) || (this));
  }

  tap(logic?): Promise<any> {
    return this.loaded
      .toPromise()
      .then(x => (logic && logic(x)) || (this));
  }

}

class AceEditor extends CodeEditor {

  private ace;
  private emmet;
  private extEmmet;
  protected setters = {
    tabSize: (value) => {
      this.instance.session.setTabSize(2);
    },
    emmet: (enable) => {
      if (enable) {
        this.extEmmet.setCore(this.emmet);
      }
      this.instance.setOption('enableEmmet', enable);
    },
    folding: (folding) => {
      switch (typeof folding) {
        case 'boolean':
          this.instance.session.setFoldStyle('markbeginend');
          break;
        case 'string':
          this.instance.session.setFoldStyle(folding);
          break;
      }

    },
    lang: (lang: string) => {
      switch (lang) {
        case 'html':
        case 'ace/mode/html':
          this.instance.session.setMode('ace/mode/html');
          this.setters.emmet(true);
          break;
        case 'javascript':
        case 'ace/mode/javascript':
        case AssetTypeEnum.JAVASCRIPT:
          this.instance.session.setMode('ace/mode/javascript');
          break;
        case 'groovy':
        case 'ace/mode/groovy':
        case AssetTypeEnum.GROOVY:
          this.instance.session.setMode('ace/mode/groovy');
          break;
        case 'css':
        case 'stylesheet':
        case AssetTypeEnum.CSS:
        case 'ace/mode/css':
          this.instance.session.setMode('ace/mode/css');
          break;
        case 'scss':
        case 'sass':
        case AssetTypeEnum.SCSS:
        case 'ace/mode/sass':
          this.instance.session.setMode('ace/mode/sass');
          break;
        case AssetTypeEnum.FREEMARKER:
          this.instance.session.setMode('ace/mode/ftl');
          break;
      }
    },
    wrap: (wrap: boolean) => {
      this.instance.getSession().setUseWrapMode(wrap);
      // this.instance.setOption('wrap', wrap ? 'on' : 'off');
    },
    editable: (editable: boolean) => {
      this.instance.setReadOnly(!editable);
    },
    fontSize: (size: number) => {
      this.instance.setFontSize(size);
    },
    theme: (theme: string) => {
      switch (theme) {
        case 'dark':
        case 'idle_fingers':
          this.instance.setTheme('ace/theme/idle_fingers');
          break;
        case 'light':
        case 'chrome':
        case 'default':
        default:
          this.instance.setTheme('ace/theme/chrome');
          break;
      }
    },
    content: (content) => {
      this.content(content);
    }
  };

  constructor() {
    super();
    requirejs(['ace/ace', 'ace/ext/emmet', 'emmet'], (ace, extEmmet) => {
      const loaded = this.loaded;
      this.ace = ace;
      this.emmet = window['emmet'];
      this.extEmmet = extEmmet;
      loaded.next(true);
      loaded.complete();
    });
  }

  content(nextContent?: string): Promise<string> {
    return this.tap(() => {
      if (nextContent !== undefined) {
        this.instance.setValue(nextContent); // or session.setValue
        this.instance.clearSelection();
        this.instance.moveCursorToPosition({ row: 0, column: 0 });
        return nextContent;
      } else {
        return this.instance.getValue(); // or session.getValue
      }
    });
  }

  render(elem: HTMLElement, options?): Promise<AceEditor> {
    return this.tap(() => {
      let { ace, rendered } = this;
      let editor = ace.edit(elem);
      editor.getSession().on('change', (e) => {
        this.changes.next(e);
      });
      // this.elem = elem;
      this.instance = editor;
      rendered.next(true);
      rendered.complete();
      if (options) {
        this.options(options);
      }
    });
  }

}

class MonacoEditor extends CodeEditor {

  protected setters = {
    tabSize: (value) => {
      this.instance.updateOptions({  });
    },
    emmet: (enable) => {
      return false;
    },
    folding: (folding) => {
      this.instance.updateOptions({
        folding: (folding === 'always') || (folding === 'hover') || folding,
        showFoldingControls: typeof folding === 'string' ? folding : 'hover'
      });
    },
    lang: (lang: string) => {

    },
    wrap: (wrap: boolean) => {

    },
    editable: (editable: boolean) => {
      this.instance.updateOptions({ readOnly: !editable });
    },
    fontSize: (size: number) => {
      this.instance.updateOptions({ fontSize: size });
    },
    theme: (theme: string) => {
      switch (theme) {
        case 'dark':

          break;
        case 'light':
        case 'default':
        default:

          break;
      }
    },
    content: (content) => {

    }
  };

  // https://microsoft.github.io/monaco-editor/api/interfaces/monaco.editor.istandalonecodeeditor.html
  // https://microsoft.github.io/monaco-editor/api/interfaces/monaco.editor.ieditoroptions.html
  // https://microsoft.github.io/monaco-editor/api/interfaces/monaco.editor.ieditorconstructionoptions.html
  // 'vs' (default), 'vs-dark', 'hc-black'
  constructor() {
    super();
  }

  content(nextContent?: string): Promise<string> {
    return this.tap(() => {
      if (nextContent !== undefined) {
        this.instance.setValue(nextContent);
        return nextContent;
      } else {
        return this.instance.getValue();
      }
    });
  }

  render(elem: any, opts: any): Promise<CodeEditor> {
    return this.tap(() => {
      monaco.editor.create(elem);
    });
  }

}

@Component({
  selector: 'std-code-editor',
  template: `
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
export class CodeEditorComponent implements OnInit, OnChanges, AfterViewInit {

  @ViewChild('editor') editorRef: ElementRef;

  @Input() asset: Asset;
  @Input() content = '';

  @Output() contentChanged = new EventEmitter();

  // vendor: 'ace' | 'monaco' = 'ace';

  private editor: CodeEditor;

  get elem() {
    return this.editorRef.nativeElement;
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
    if (this.editor) {
      this.editor.content('');
      this.editor.option('editable', false);
    }
    this.contentService
      .content(asset.siteCode, asset.id)
      .subscribe(a => {
        this.content = a.content;
        this.configure();
      });
  }

  createEditor() {
    let editor = CodeEditor.factory(this.asset || 'ace');
    editor.render(this.elem)
      .then(() => this.configure());
    this.editor = editor;
  }

  configure() {
    let { editor, content, asset } = this;
    if (editor) {
      editor.options({
        editable: true,
        lang: asset.type
      });
      editor.content(content);
    }
  }

}
