import { Component, ElementRef, Input, OnChanges, OnInit, ViewChild } from '@angular/core';
import { ContentService } from '../../services/content.service';
import { Asset } from '../../models/asset.model';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { AssetTypeEnum } from '../../enums/asset-type.enum';
import { combineLatest, filter, takeUntil, zip } from 'rxjs/operators';
import { ComponentBase } from '../../classes/component-base.class';
import { isNullOrUndefined } from 'util';

interface Libs {
  fetched: boolean;
  highlighter?: Object;
  mode?: Object;
  theme?: Object;
  dom?: Object;
}

const MAP = {
  'js': 'javascript',
  'ts': 'typescript'
};

// tslint:disable-next-line:max-line-length
const ALL_MODES = ['abap', 'abc', 'actionscript', 'ada', 'applescript', 'asciidoc', 'autohotkey', 'batchfile', 'behaviour', 'bro', 'c9search', 'cirru', 'clojure', 'cobol', 'coffee', 'coldfusion', 'csharp', 'css', 'curly', 'd', 'dart', 'diff', 'django', 'dockerfile', 'dot', 'drools', 'eiffel', 'ejs', 'elixir', 'elm', 'erlang', 'forth', 'fortran', 'ftl', 'gcode', 'gherkin', 'gitignore', 'glsl', 'gobstones', 'golang', 'graphqlschema', 'groovy', 'haml', 'handlebars', 'haskell', 'haxe', 'hjson', 'html', 'ini', 'io', 'jack', 'jade', 'java', 'javascript', 'json', 'jsoniq', 'jsp', 'jssm', 'jsx', 'julia', 'kotlin', 'latex', 'less', 'liquid', 'lisp', 'livescript', 'logiql', 'lsl', 'lua', 'luapage', 'lucene', 'makefile', 'markdown', 'mask', 'matlab', 'maze', 'mel', 'mushcode', 'mysql', 'nix', 'nsis', 'objectivec', 'ocaml', 'pascal', 'perl', 'pgsql', 'php', 'pig', 'powershell', 'praat', 'prolog', 'properties', 'protobuf', 'python', 'r', 'razor', 'rdoc', 'red', 'rhtml', 'rst', 'ruby', 'rust', 'sass', 'scad', 'scala', 'scheme', 'scss', 'sh', 'sjs', 'smarty', 'snippets', 'space', 'sparql', 'sql', 'sqlserver', 'stylus', 'svg', 'swift', 'tcl', 'tex', 'text', 'textile', 'toml', 'tsx', 'turtle', 'twig', 'typescript', 'vala', 'vbscript', 'velocity', 'verilog', 'vhdl', 'wollok', 'xml', 'xquery', 'yaml'];

@Component({
  selector: 'std-syntax-highlighter',
  templateUrl: './syntax-highlighter.component.html',
  styleUrls: ['./syntax-highlighter.component.scss']
})
export class SyntaxHighlighterComponent extends ComponentBase implements OnInit, OnChanges {

  @Input() asset: Asset;
  @ViewChild('code') elemRef: ElementRef;

  libs$ = new BehaviorSubject<Libs>({ fetched: false });
  content$ = new BehaviorSubject<string>(null);

  get elem() {
    return this.elemRef ? this.elemRef.nativeElement : null;
  }

  private session;

  constructor(private contentService: ContentService) {
    super();
  }

  ngOnInit() {
    let { libs$, content$ } = this;
    libs$.pipe(
      filter(libs => libs.fetched),
      zip(
        content$.pipe(filter(c => c !== null)),
        (libs: Libs, content: string) => ({ content, ...libs })),
      this.untilDestroyed()
    ).subscribe(reqs => this.render(reqs));
    this.addTearDown(() => {
      libs$.complete();
      content$.complete();
      this.tearDown();
    });
  }

  tearDown() {

    ['#ace_highlight', '#ace-chrome'].forEach(sheet => {
      let style = document.querySelector(sheet);
      if (!isNullOrUndefined(style)) {
        style.parentNode.removeChild(style);
      }
    });

    if (!isNullOrUndefined(this.session)) {
      this.session.destroy();
    }

  }

  ngOnChanges() {
    let { asset, elem, session, libs$, content$ } = this;
    if (asset) {

      libs$.next({ fetched: false });

      if (!isNullOrUndefined(elem)) {
        elem.innerHTML = '';
      }

      if (!isNullOrUndefined(session)) {
        session.destroy();
      }

      requirejs(
        ['ace/ext/static_highlight', this.mode(), 'ace/theme/chrome', 'ace/lib/dom'],
        function (highlighter, mode, theme, dom) {
          mode = mode.Mode;
          libs$.next({ highlighter, mode, theme, dom, fetched: true });
        });

      this.contentService
        .read(asset.id)
        .pipe(this.untilDestroyed())
        .subscribe(data => content$.next(data.content));

    }
  }

  render(requirements) {
    let { elem } = this;
    let { highlighter, mode, theme, dom, content } = requirements;
    let highlighted = highlighter.render(content, new mode(), theme);
    dom.importCssString(highlighted.css, 'ace_highlight');
    elem.innerHTML = highlighted.html;
    this.session = highlighted.session;
  }

  mode() {
    let
      { asset } = this,
      index = asset.label.lastIndexOf('.'),
      hasExtension = (index !== -1),
      extension = hasExtension ? asset.label.slice(index + 1) : null,
      type = MAP[extension] || extension;
    if (hasExtension && ALL_MODES.includes(type)) {
      return `ace/mode/${type}`;
    } else {
      return `ace/mode/text`;
    }
  }

}

// Manual mode selection
// switch (asset.type) {
//   case AssetTypeEnum.CSS:
//     return 'ace/mode/css';
//   case AssetTypeEnum.LESS:
//     return 'ace/mode/less';
//   case AssetTypeEnum.SCSS:
//     return 'ace/mode/scss';
//   case AssetTypeEnum.SASS:
//     return 'ace/mode/sass';
//   case AssetTypeEnum.JSON:
//     return 'ace/mode/json';
//   case AssetTypeEnum.JAVASCRIPT:
//     return 'ace/mode/javascript';
//   case AssetTypeEnum.TYPESCRIPT:
//     return 'ace/mode/typescript';
//   case AssetTypeEnum.HTML:
//     return 'ace/mode/html';
//   case AssetTypeEnum.GROOVY:
//     return 'ace/mode/groovy';
//   case AssetTypeEnum.FREEMARKER:
//     return 'ace/mode/ftl';
//   case AssetTypeEnum.XML:
//     return 'ace/mode/xml';
//   case AssetTypeEnum.SVG:
//     return 'ace/mode/xml';
//   default:
//     return 'ace/mode/text';
// }
