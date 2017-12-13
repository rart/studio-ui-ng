import { Component, HostBinding, Input, OnInit } from '@angular/core';

@Component({
  selector: 'std-spinner',
  templateUrl: './spinner.component.html',
  styleUrls: ['./spinner.component.scss']
})
export class SpinnerComponent implements OnInit {

  @HostBinding('class.loader') _loader = true;

  @Input() styles = '';

  // @HostBinding('class') get() {
  //   return `${this.styles} loader`;
  // }

  constructor() { }

  ngOnInit() {
  }

}
