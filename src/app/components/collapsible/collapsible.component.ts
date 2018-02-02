import { Component, ContentChild, HostBinding, Input, OnInit, Output, TemplateRef } from '@angular/core';
import { Subject } from 'rxjs/Subject';
import { collapseInOut } from '../../utils/animations.utils';

@Component({
  selector: 'std-collapsible',
  templateUrl: './collapsible.component.html',
  styleUrls: ['./collapsible.component.scss'],
  animations: [collapseInOut('*', 'void')]
})
export class CollapsibleComponent implements OnInit {

  @ContentChild('toggleTemplate') toggleTemplate: TemplateRef<any>;
  
  @Input() title = 'Toggle';
  @Input() indicator = true;
  @Input() @HostBinding('class.closed') closed = false;

  @Output() closedChange = new Subject();

  constructor() {

  }

  ngOnInit() {

  }

  toggle(event) {
    this.closedChange.next(this.closed = !this.closed);
  }

}
