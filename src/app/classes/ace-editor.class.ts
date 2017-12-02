import { CodeEditor, CodeEditorChoiceEnum } from './code-editor.abstract';
import { AssetTypeEnum } from '../enums/asset-type.enum';

export class AceEditor extends CodeEditor {

  readonly vendor = CodeEditorChoiceEnum.ACE;

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
    value: (value) => {
      this.value(value);
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

  value(nextContent?: string): Promise<string> {
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
        this.changes.next({
          value: this.instance.getValue(),
          originalEvent: e
        });
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

  dispose(): void {
    this.disposeSubjects();
    this.instance.destroy();
    // if (this.instance) {
    //   this.instance.destroy();
    // }
  }

}
