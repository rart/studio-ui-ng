import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'std-spinner',
  templateUrl: './spinner.component.html',
  styleUrls: ['./spinner.component.scss']
})
export class SpinnerComponent implements OnInit {

  @Input() styles = '';

  constructor() { }

  ngOnInit() {
  }

}
