import { Component, ElementRef, Input, OnChanges, OnInit, AfterViewInit, ViewChild } from '@angular/core';
import { password } from '../../app.utils';

@Component({
  selector: 'std-font-visualizer',
  templateUrl: './font-visualizer.component.html',
  styleUrls: ['./font-visualizer.component.scss']
})
export class FontVisualizerComponent implements OnInit, OnChanges, AfterViewInit {

  @ViewChild('style') styleNode: ElementRef;

  @Input() src;
  @Input() type;

  token;
  format;
  text = `Duis mollis, est non commodo luctus, nisi erat porttitor ligula, eget lacinia odio sem nec elit. Sed posuere consectetur est at lobortis. Fusce dapibus, tellus ac cursus commodo, tortor mauris condimentum nibh, ut fermentum massa justo sit amet risus. Vivamus sagittis lacus vel augue laoreet rutrum faucibus dolor auctor. Maecenas sed diam eget risus varius blandit sit amet non magna. Maecenas sed diam eget risus varius blandit sit amet non magna. Vestibulum id ligula porta felis euismod semper.`;

  constructor() {
  }

  ngOnInit() {

  }

  ngAfterViewInit() {

  }

  ngOnChanges() {
    pretty('yellow', 'ngOnChanges');
    if (this.styleNode) {
      let style = this.styleNode.nativeElement;
      console.log(style);
      style.deleteRule(0);
      style.insertRule(`
        @font-face {
          font-family: 'font-visualizer-font';
          font-style: normal;
          font-weight: 400;
          src: url({{src}}) format('woff2');
          unicode-range: U+0460-052F, U+20B4, U+2DE0-2DFF, U+A640-A69F;
        }`, 0);
    }
  }

}
