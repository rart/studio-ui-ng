import { CodeEditor, CodeEditorChoiceEnum } from './code-editor.abstract';
import { isNullOrUndefined } from 'util';

let Monaco;

// https://github.com/Microsoft/vscode/blob/master/src/vs/editor/standalone/browser/standaloneCodeEditor.ts
// import { IEditorConstructionOptions } from 'vs/editor/standalone/browser/standaloneCodeEditor';

// https://github.com/Microsoft/vscode/blob/master/src/vs/editor/common/config/editorOptions.ts
// import { IEditorOptions } from 'vs/editor/common/config/editorOptions';

// https://microsoft.github.io/monaco-editor/playground.html
// https://microsoft.github.io/monaco-editor/api/interfaces/monaco.editor.istandalonecodeeditor.html
// https://microsoft.github.io/monaco-editor/api/interfaces/monaco.editor.ieditoroptions.html
// https://microsoft.github.io/monaco-editor/api/interfaces/monaco.editor.ieditorconstructionoptions.html
// 'vs' (default), 'vs-dark', 'hc-black'
// scrollBeyondLastLine: false,

// const internalPropAggregation = {
//   scrollBeyondLastLine: false
// };

export class MonacoEditor extends CodeEditor {

  readonly vendor = CodeEditorChoiceEnum.MONACO;

  protected setters = {
    tabSize: (value) => {
      // this.instance.updateOptions({});
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
      lang = {}[lang] || lang;
      Monaco.editor.setModelLanguage(
        this.instance.getModel(),
        lang);
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
          Monaco.editor.setTheme('vs-dark');
          break;
        case 'light':
        case 'default':
        default:
          Monaco.editor.setTheme('vs');
          break;
      }
    },
    value: (value) => {
      this.instance.setValue(value);
    }
  };

  constructor() {
    super();
    this.require(['vs/editor/editor.main'], () => {
      Monaco = window['monaco'];
    });
  }

  value(nextValue?: string): Promise<string> {
    // if (!isNullOrUndefined(nextValue) && isNullOrUndefined(this.instance)) {
    //   return this.instance.getValue();
    // }
    return this.tap(() => {
      if (nextValue !== undefined) {
        this.instance.setValue(nextValue);
        return nextValue;
      } else {
        return this.instance.getValue();
      }
    });
  }

  render(elem: any, options: any): Promise<CodeEditor> {
    return this.tap(() => {
      let { rendered } = this;
      let editor = Monaco.editor.create(elem, {
        scrollBeyondLastLine: false,
        value: options.value || ''
      });
      if (options) {
        if (options.value) {
          delete options.value;
        }
        this.options(options);
      }
      editor.getModel().onDidChangeContent((e) => {
        this.changes.next({
          value: this.instance.getValue(),
          originalEvent: e
        });
      });
      this.instance = editor;
      rendered.next(true);
      rendered.complete();
    });
  }

  resize() {
    this.ready(() => this.instance.layout());
  }

  focus() {
    this.ready(() => this.instance.focus());
  }

  dispose(): void {
    this.disposeSubjects();
    if (this.instance) {
      this.instance.dispose();
      this.instance.destroy();
    }
  }

}
