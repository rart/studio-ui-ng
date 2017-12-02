import { Component, ElementRef, Input, OnChanges, OnInit, AfterViewInit, ViewChild } from '@angular/core';
import { password } from '../../app.utils';
import { MimeTypeEnum } from '../../enums/mime-type.enum';

@Component({
  selector: 'std-font-visualizer',
  templateUrl: './font-visualizer.component.html',
  styleUrls: ['./font-visualizer.component.scss']
})
export class FontVisualizerComponent implements OnInit, OnChanges, AfterViewInit {

  // @ViewChild('style') styleNode: ElementRef;
  private styleNode: any;

  @Input() src;
  @Input() type;
  @Input() text;

  // M\u00E9nage \u00E0 trois.

  private getFormat() {
    switch (this.type) {
      case MimeTypeEnum.EOT:
        return 'embedded-opentype';
      case MimeTypeEnum.TTF:
        return 'truetype';
      case MimeTypeEnum.SVG:
        return 'svg';
      default:
        return this.type
          .replace('application/x-font-', '')
          .replace('application/font-', '');
    }
  }

  constructor(private elemRef: ElementRef) {

  }

  ngOnInit() {
    this.autoText();
  }

  ngAfterViewInit() {

  }

  ngOnChanges() {
    if (!this.elemRef) {
      return;
    }
    this.autoText();
    this.resetFont();
  }

  autoText() {
    if (this.text) {
      return;
    }
    let options = [

      'The quick brown fox jumps over the lazy dog',

      'My lord, as I was sewing in my closet,\n' +
      'Lord Hamlet, with his doublet all unbrac\'d,\n' +
      'No hat upon his head, his stockings foul\'d,\n' +
      'Ungart\'red, and down-gyved to his ankle;\n' +
      'Pale as his shirt, his knees knocking each other,\n' +
      'And with a look so piteous in purport\n' +
      'As if he had been loosed out of hell \n' +
      'To speak of horrors- he comes before me.',

      'He took me by the wrist and held me hard;\n' +
      'Then goes he to the length of all his arm,\n' +
      'And, with his other hand thus o\'er his brow,\n' +
      'He falls to such perusal of my face\n' +
      'As he would draw it. Long stay\'d he so.',

      'O, she did so course o\'er my exteriors with such' +
      ' a greedy intention, that the appetite of her eye ' +
      'did seem to scorch me up like a burning-glass! Here\'s ' +
      'another letter to her: she bears the purse too; she is ' +
      'a region in Guiana, all gold and bounty. I will be ' +
      'cheater to them both, and they shall be exchequers to ' +
      'me; they shall be my East and West Indies, and I will ' +
      'trade to them both. Go bear thou this letter to Mistress ' +
      'Page; and thou this to Mistress Ford: we will thrive, lads, ' +
      'we will thrive.'

    ];
    this.text = options[Math.floor(Math.random() * options.length)];
  }

  resetFont() {

    let
      sheet: CSSStyleSheet,
      style = this.styleNode;

    if (style) {
      this.elemRef.nativeElement.removeChild(style);
    }

    this.styleNode = style = document.createElement('style');
    this.elemRef.nativeElement.appendChild(style);
    sheet = <CSSStyleSheet>style.sheet;

    if (sheet.rules.length) {
      sheet.deleteRule(0);
    }

    let ruleContent = `
        @font-face {
          font-family: 'Studio-Font-Visualizer';
          src: url(${this.src}) format('${this.getFormat()}');
          font-style: normal;
          font-weight: normal;
        }`.trim();

    sheet.insertRule(ruleContent, 0);

  }

}
