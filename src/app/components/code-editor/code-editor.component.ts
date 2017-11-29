import { AfterViewInit, Component, ElementRef, Input, OnChanges, OnInit, ViewChild } from '@angular/core';
import {environment} from '../../../environments/environment';
import { Subject } from 'rxjs/Subject';
import { ReplaySubject } from 'rxjs/ReplaySubject';
import { AssetTypeEnum } from '../../enums/asset-type.enum';

const BOTH_TEMPLATE = `
  <div class="ace-wrapper">
    <div class="ace-elem" #aceElem></div>
  </div>
  <div class="monaco-wrapper">
    <div class="monaco-editor" #monacoElem></div>
  </div>`;

const BOTH_STYLES = [`
  .ace-elem,
  .ace-wrapper,
  .monaco-editor {
    width: 600px;
    height: 100px;
    margin: 20px auto;
    text-align: left;
  }
`];

// declare var ace: any;
// declare var emmet: any;
// declare var monaco: any;
declare var requirejs: (deps, callback?, error?) => any;

requirejs({
  baseUrl: `${environment.assetsUrl}/js/vendor`,
  paths: {
    'vs': `${environment.assetsUrl}/js/vendor/vs`,
    'ace': `${environment.assetsUrl}/js/vendor/ace`
  }
});

abstract class CodeEditor {
  // protected elem: any;
  // protected opts: any;
  protected instance: any;
  protected changes = new Subject<any>();
  protected events = new Subject<any>();
  protected loaded = new ReplaySubject<boolean>(1);
  constructor(protected elem,
              protected opts) {
  }
  subscribe(subscriber, ...operators) {
    return this.events
      .pipe(...operators)
      .subscribe(subscriber);
  }
  whenLoaded(subscriber) {
    this.loaded.subscribe(subscriber);
  }
  abstract render(elem, opts): void;
  abstract get content(): string;
  abstract set content(content: string);
  abstract get options(): any;
  abstract set options(options: any);
}

// https://microsoft.github.io/monaco-editor/api/interfaces/monaco.editor.ieditoroptions.html
// https://microsoft.github.io/monaco-editor/api/interfaces/monaco.editor.ieditorconstructionoptions.html

interface CodeEditorOptions {
  tabSize: number;
  lang: string;
}

class AceEditor extends CodeEditor {
  private ace;
  private emmet;
  private extEmmet;
  private setters = {
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
          this.instance.session.setMode('ace/mode/javascript');
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
      this.instance.setReadOnly(false);
    },
    fontSize: (size: number) => {
      this.instance.setFontSize(12);
    },
    theme: (theme: string) => {
      switch (theme) {
        case 'chrome':
        case 'default':
        default:
          this.instance.setTheme('ace/theme/chrome');
      }
    }
  };
  constructor(elem, options) {
    super(elem, Object.assign({
      tabSize: 2,
      lang: 'html',
      folding: true,
      wrap: false,
      editable: true,
      fontSize: 14,
      theme: 'chrome'
    }, options));
    const loaded = this.loaded;
    requirejs(['ace/ace', 'ace/ext/emmet', 'emmet'], (ace, extEmmet) => {
      this.onLibsLoad(ace, extEmmet, window['emmet']);
      loaded.next(true);
      loaded.complete();
    });
  }
  private onLibsLoad(ace, extEmmet, emmet) {
    this.ace = ace;
    this.emmet = emmet;
    this.extEmmet = extEmmet;
  }
  private configure() {
    let
      options = this.opts,
      setters = this.setters;
    this.loaded.subscribe(() =>
      Object.keys(options).forEach(opt =>
        setters[opt](options[opt])));
  }
  render(): void {
    this.loaded.subscribe(() => {
      let {ace, elem} = this;
      let editor = ace.edit(elem);
      editor.getSession().on('change', (e) => {
        this.changes.next(e);
      });
      this.instance = editor;
      this.configure();
    });
  }
  get options(): any {
    return this.opts;
  }
  set options(options: any) {
    Object.assign(this.opts, options);
    this.configure();
  }
  get content(): string {
    return this.instance.getValue(); // or session.getValue
  }
  set content(content: string) {
    this.loaded.subscribe(() => {
      this.instance.setValue(content); // or session.setValue
    });
  }
}

@Component({
  selector: 'std-code-editor',
  template: `<div class="code-editor" #editor></div>`,
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

  @Input() lang = 'html';
  @Input() content = '';

  vendor: 'ace' | 'monaco' = 'ace';

  private editor: CodeEditor;

  get elem() {
    return this.editorRef.nativeElement;
  }

  constructor() {

  }

  ngOnInit() {

  }

  ngAfterViewInit() {
    console.log('AfterViewInit');
    let editor = new AceEditor(this.elem, {
      lang: this.lang
    });
    editor.render();
    editor.whenLoaded(() => {
      editor.content = this.content;
    });
    this.editor = editor;
  }

  ngOnChanges() {
    console.log('onChanges');
    this.editor && this.editor.whenLoaded(() => {
      this.editor.options = {
        lang: this.lang
      };
      this.editor.content = this.content;
    });
  }

}










// @Component({
//   selector: 'std-code-editor',
//   template: BOTH_TEMPLATE,
//   styles: BOTH_STYLES
// }) export class CodeEditorComponent implements OnInit {
//
//   @ViewChild('aceElem') aceElem;
//   @ViewChild('monacoElem') monacoElem;
//
//   get ace() {
//     return this.aceElem.nativeElement;
//   }
//
//   get monaco() {
//     return this.monacoElem.nativeElement;
//   }
//
//   constructor() {
//
//   }
//
//   ngOnInit() {
//     requirejs(['vs/editor/editor.main'], () => {
//       this.initMonaco();
//     });
//     requirejs(['ace/ace', 'ace/ext/emmet', 'emmet'], () => {
//       this.initAce();
//     });
//   }
//
//   initAce() {
//
//     let ace = requirejs('ace/ace');
//     let emm = requirejs('ace/ext/emmet');
//
//     let elem = this.ace;
//     let editor = ace.edit(elem);
//
//     emm.setCore(emmet);
//
//     editor.session.setTabSize(2);
//     editor.session.setFoldStyle('markbeginend');
//     editor.session.setMode('ace/mode/html');
//     editor.setOption('enableEmmet', true);
//     editor.setOption('wrap', 'off');
//     editor.setReadOnly(false);
//     editor.setFontSize(12);
//     editor.setTheme('ace/theme/chrome');
//
//   }
//
//   initMonaco() {
//
//     let elem = this.monaco;
//
//     monaco.editor.create(elem, {
//       lineNumbers: true,
//       roundedSelection: false,
//       scrollBeyondLastLine: false,
//       wrappingColumn: -1,
//       folding: true,
//       renderLineHighlight: true,
//       overviewRulerLanes: 0,
//       theme: 'vs-dark',
//       customPreventCarriageReturn: true,
//       scrollbar: {
//         vertical: 'hidden',
//         horizontal: 'auto',
//         useShadows: false
//       }
//     });
//
//   }
//
// }

// const ACE_TEMPLATE = `
//   <select [(ngModel)]="theme" (change)="aceOptionsChanged()">
//     <option value="ace/theme/chrome">Chrome</option>
//     <option value="ace/theme/ambiance">Ambiance</option>
//   </select>
//   <select [(ngModel)]="mode" (change)="aceOptionsChanged()">
//     <option value="ace/mode/ftl">Freemarker</option>
//     <option value="ace/mode/javascript">JavaScript</option>
//     <option value="ace/mode/typescript">TypeScript</option>
//     <option value="ace/mode/groovy">Groovy</option>
//     <option value="ace/mode/css">CSS</option>
//     <option value="ace/mode/sass">SASS</option>
//     <option value="ace/mode/html">HTML</option>
//   </select>
//   <select [(ngModel)]="fontSize" (change)="aceOptionsChanged()">
//     <option value="10">10</option>
//     <option value="12">12</option>
//     <option value="14">14</option>
//     <option value="16">16</option>
//   </select>
//   <div class="editor-wrapper">
//     <div class="editor-elem" #editor></div>
//   </div>`;

// const ACE_STYLES = [`
//   .editor-elem,
//   .editor-wrapper {
//     width: 100%;
//     height: 500px;
//   }
// `];

// declare var ace: any;
// declare var emmet: any;
// declare var requirejs: (deps, callback?, error?) => any;

// requirejs({
//   baseUrl: `${environment.assetsUrl}/js/vendor`,
//   paths: {
//     'vs': `${environment.assetsUrl}/js/vendor/vs`,
//     'ace': `${environment.assetsUrl}/js/vendor/ace`
//   }
// });

// @Component({
//   selector: 'std-code-editor',
//   template: ACE_TEMPLATE,
//   styles: ACE_STYLES
// }) export class CodeEditorComponent implements OnInit {

//   @ViewChild('editor') editorElem;
//   editor = null;

//   fontSize = '12';
//   theme = 'ace/theme/chrome';
//   mode = 'ace/mode/html';

//   get elem() {
//     return this.editorElem.nativeElement;
//   }

//   constructor() {

//   }

//   ngOnInit() {
//     requirejs(['ace/ace', 'ace/ext/emmet', 'emmet'], (ace, emmetExt) => {
//       this.initAce(ace, emmetExt);
//     });
//   }

//   aceOptionsChanged() {
//     this.editor.setTheme(this.theme);
//     this.editor.session.setMode(this.mode);
//     this.editor.setFontSize(parseInt(this.fontSize, 10));
//   }

//   initAce(ace, ext) {

//     let elem = this.elem;
//     let editor = requirejs('ace/ace').edit(elem);
//     let Emmet = requirejs('ace/ext/emmet');

//     Emmet.setCore(emmet);

//     editor.session.setTabSize(2);
//     editor.session.setFoldStyle('markbeginend');
//     editor.session.setMode(this.mode);
//     editor.setOption('enableEmmet', true);
//     editor.setOption('wrap', 'off');
//     editor.setReadOnly(false);
//     editor.setFontSize(parseInt(this.fontSize, 10));
//     editor.setTheme(this.theme);

//     this.editor = editor;

//   }

// }

// ***********
// MONACO...
// ***********

// declare var monaco: any;

// @Component({
//   selector: 'std-code-editor',
//   template: `<div class="editor-elem" #editor></div>`,
//   styles: [`
//     .editor-elem {
//       width: 800px;
//       height: 300px;
//       border: 1px solid grey;
//       text-align: left;
//       margin: auto;
//     }
//   `]
// })
// export class CodeEditorComponent implements OnInit {

//   @ViewChild('editor') editorElem;
//   editor = null;

//   text = 'function sayHi() {\n\tconsole.log("");\n}';

//   private require = window['require'];

//   get elem() {
//     return this.editorElem.nativeElement;
//   }

//   constructor() {

//   }

//   ngOnInit() {

//     let elem = this.elem;

//     this.require.config({ paths: { 'vs': `${environment.assetsUrl}/js/vendor/vs`, }});
//     this.require(['vs/editor/editor.main'], () => {
//       let editor = monaco.editor.create(elem, {
//         value: this.text,
//         language: 'javascript'
//       });
//     });

//   }

// }
