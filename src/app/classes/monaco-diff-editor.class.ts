import { CodeEditor, CodeEditorChoiceEnum } from './code-editor.abstract';
import { MonacoEditor } from './monaco-editor.class';

export class MonacoDiffEditor extends MonacoEditor {

  readonly vendor;

  private navigator;
  private elem;
  private monacoElem;

  protected setters = {
    tabSize: (value) => {
      let model = this.instance.getModel();
      let original = model.original;
      let modified = model.modified;
      original.updateOptions({ tabSize: value });
      modified.updateOptions({ tabSize: value });
    },
    emmet: (enable) => {
      return false;
    },
    folding: (folding) => {

    },
    lang: (lang: string) => {
      lang = {}[lang] || lang;
      monaco.editor.setModelLanguage(
        this.instance.getModel().original,
        lang);
      monaco.editor.setModelLanguage(
        this.instance.getModel().modified,
        lang);
    },
    wrap: (wrap: boolean) => {

    },
    editable: (editable: boolean) => {
      let model = this.instance.getModel();
      let original = model.original;
      let modified = model.modified;
      original.updateOptions({ readOnly: !editable });
      modified.updateOptions({ readOnly: !editable });
    },
    fontSize: (size: number) => {
      let model = this.instance.getModel();
      let original = model.original;
      let modified = model.modified;
      original.updateOptions({ fontSize: size });
      modified.updateOptions({ fontSize: size });
    },
    theme: (theme: string) => {
      switch (theme) {
        case 'dark':
          monaco.editor.setTheme('vs-dark');
          break;
        case 'light':
        case 'default':
        default:
          monaco.editor.setTheme('vs');
          break;
      }
    },
    original: (value) => {
      this.vendorSetValue(value);
    },
    modified: (value) => {
      this.vendorSetValue(value);
    }
  };

  constructor() {
    super();
    this.vendor = CodeEditorChoiceEnum.MONACO_DIFF;
  }

  render(elem: any, options: any): Promise<CodeEditor> {
    return this.tap(() => {

      let { rendered$ } = this;
      let monacoElem = document.createElement('div');
      let originalModel = monaco.editor.createModel(options.original, options.lang);
      let modifiedModel = monaco.editor.createModel(options.modified, options.lang);

      // @see https://github.com/Microsoft/monaco-editor/issues/672
      elem.appendChild(monacoElem);
      monacoElem.style.width = '100%';
      monacoElem.style.height = '100%';

      let editor = monaco.editor.createDiffEditor(monacoElem);

      editor.setModel({
        original: originalModel,
        modified: modifiedModel
      });

      // The diff editor offers a navigator to jump between changes. Once
      // the diff is computed the <em>next()</em> and <em>previous()</em>
      // method allow navigation. By default setting the selection in the
      // editor manually resets the navigation state.
      let navigator = monaco.editor.createDiffNavigator(editor, {
        // resets the navigator state when the user selects something in the editor
        followsCaret: true,
        // jump from line to line
        ignoreCharChanges: true
      });

      if (options) {
        if (options.value) {
          delete options.value;
        }
        this.options(options);
      }

      this.elem = elem;
      this.monacoElem = monacoElem;
      this.instance = editor;
      this.navigator = navigator;

      rendered$.next(true);
      rendered$.complete();

      // editor.onDidUpdateDiff((e) => {
      //   this.changes$.next({
      //     value: this.instance.getValue(),
      //     originalEvent: e
      //   });
      // });

      modifiedModel.onDidChangeContent((e) => {
        this.changes$.next({
          value: this.instance.getValue(),
          originalEvent: e
        });
      });

    });
  }

  protected vendorSetValue(value: string) {
    let options = <any>this.cfg;
    let originalModel = monaco.editor.createModel(options.original, options.lang);
    let modifiedModel = monaco.editor.createModel(options.modified, options.lang);
    this.instance.setModel({
      original: originalModel,
      modified: modifiedModel
    });
  }

  next() {
    this.navigator.next();
  }

  prev() {
    this.navigator.previous();
  }

  dispose() {
    super.dispose();
    // @see https://github.com/Microsoft/monaco-editor/issues/672
    this.elem.removeChild(this.monacoElem);
  }

}
