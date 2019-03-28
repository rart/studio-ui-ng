import { AfterViewInit, Component, ElementRef, HostListener, Output, ViewChild } from '@angular/core';
import { Subject } from 'rxjs';

@Component({
  selector: 'std-search-bar',
  templateUrl: './search-bar.component.html',
  styleUrls: ['./search-bar.component.scss']
})
export class SearchBarComponent implements AfterViewInit {

  @ViewChild('input') inputRef: ElementRef;

  @Output() queryChange = new Subject();

  value = '';
  options = {};

  get input() {
    return this.inputRef.nativeElement;
  }

  get element() {
    return this.elementRef.nativeElement;
  }

  constructor(private elementRef: ElementRef) {

  }

  ngAfterViewInit() {
    let el = this.element;
    $(el).hover(
      () => $(el).addClass('hover'),
      () => $(el).removeClass('hover')
    );
  }

  @HostListener('click')
  click(e) {
    console.log('click');
    this.input.select();
  }

  focus(e) {
    $(this.element).addClass('focus');
  }

  blur(e) {
    $(this.element).removeClass('focus');
  }

  captureEvent(e) {
    e.stopPropagation();
  }

  submit(e) {
    this.queryChange.next({ value: this.value, options: this.options });
  }

  clear(e) {
    this.value = '';
  }

}
