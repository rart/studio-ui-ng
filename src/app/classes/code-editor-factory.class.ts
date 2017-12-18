import { Asset } from '../models/asset.model';
import { AssetTypeEnum } from '../enums/asset-type.enum';
import { CodeEditor, CodeEditorChoiceEnum } from './code-editor.abstract';
import { MonacoEditor } from './monaco-editor.class';
import { AceEditor } from './ace-editor.class';
import { MonacoDiffEditor } from './monaco-diff-editor.class';

export class CodeEditorFactory {
  static create(assetOrType: Asset | string): CodeEditor {
    let choice = CodeEditorFactory.choice(assetOrType);
    switch (choice) {
      case CodeEditorChoiceEnum.MONACO_DIFF:
        return new MonacoDiffEditor();
      case CodeEditorChoiceEnum.MONACO:
        return new MonacoEditor();
      case CodeEditorChoiceEnum.ACE:
      default:
        return new AceEditor();

    }
  }
  static choice(assetOrType: Asset | string): CodeEditorChoiceEnum {
    let type = (typeof assetOrType === 'string')
      ? <string>assetOrType
      : (<Asset>assetOrType).type;
    switch (type) {

      case CodeEditorChoiceEnum.MONACO_DIFF:
        return CodeEditorChoiceEnum.MONACO_DIFF;

      // Currently (December 2017) monaco provides OOTB rich IntelliSense for:
      // TypeScript, JavaScript, CSS, LESS, SCSS, JSON, HTML
      case AssetTypeEnum.CSS:
      case AssetTypeEnum.LESS:
      case AssetTypeEnum.SCSS:
      case AssetTypeEnum.JSON:
      case AssetTypeEnum.JAVASCRIPT:
      case AssetTypeEnum.TYPESCRIPT:
      // case AssetTypeEnum.HTML: // Ace has better emmet support, though.
      case CodeEditorChoiceEnum.MONACO:
        return CodeEditorChoiceEnum.MONACO;

      case AssetTypeEnum.HTML:
      case AssetTypeEnum.GROOVY:
      case AssetTypeEnum.FREEMARKER:
      case CodeEditorChoiceEnum.ACE:
      default:
        return CodeEditorChoiceEnum.ACE;

    }
  }
}
