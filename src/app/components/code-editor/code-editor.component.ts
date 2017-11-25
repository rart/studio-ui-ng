import {Component, OnInit, ViewChild} from '@angular/core';
import {environment} from '../../../environments/environment';

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

declare var ace: any;
declare var emmet: any;
declare var monaco: any;
declare var requirejs: (deps, callback?, error?) => any;

requirejs({
  baseUrl: `${environment.assetsUrl}/js/vendor`,
  paths: {
    'vs': `${environment.assetsUrl}/js/vendor/vs`,
    'ace': `${environment.assetsUrl}/js/vendor/ace`
  }
});

@Component({
  selector: 'std-code-editor',
  template: BOTH_TEMPLATE,
  styles: BOTH_STYLES
}) export class CodeEditorComponent implements OnInit {

  @ViewChild('aceElem') aceElem;
  @ViewChild('monacoElem') monacoElem;

  get ace() {
    return this.aceElem.nativeElement;
  }

  get monaco() {
    return this.monacoElem.nativeElement;
  }

  constructor() {

  }

  ngOnInit() {
    requirejs(['vs/editor/editor.main'], () => {
      this.initMonaco();
    });
    requirejs(['ace/ace', 'ace/ext/emmet', 'emmet'], (ace, emmetExt) => {
      this.initAce();
    });
  }

  initAce() {

    let ace = requirejs('ace/ace');
    let emm = requirejs('ace/ext/emmet');

    let elem = this.ace;
    let editor = ace.edit(elem);

    emm.setCore(emmet);

    editor.session.setTabSize(2);
    editor.session.setFoldStyle('markbeginend');
    editor.session.setMode('ace/mode/html');
    editor.setOption('enableEmmet', true);
    editor.setOption('wrap', 'off');
    editor.setReadOnly(false);
    editor.setFontSize(12);
    editor.setTheme('ace/theme/chrome');

  }

  initMonaco() {

    let elem = this.monaco;

    monaco.editor.create(elem, {
       lineNumbers: true,
       roundedSelection: false,
       scrollBeyondLastLine: false,
       wrappingColumn: -1,
       folding: true,
       renderLineHighlight: true,
       overviewRulerLanes: 0,
       theme: 'vs-dark',
       customPreventCarriageReturn: true,
       scrollbar: {
         vertical: 'hidden',
         horizontal: 'auto',
         useShadows: false
      }
    });

  }

}







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
