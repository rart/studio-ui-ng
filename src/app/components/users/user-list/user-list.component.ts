import { Component, Input, OnInit, Output } from '@angular/core';
import { User } from '../../../models/user.model';
import { Subject } from 'rxjs/Subject';
import { LookupTable } from '../../../classes/app-state.interface';

@Component({
  selector: 'std-user-list',
  templateUrl: './user-list.component.html',
  styleUrls: ['./user-list.component.scss']
})
export class UserListComponent implements OnInit {

  @Input() users: User[] = [];
  @Input() disabled: LookupTable<string> = {};

  @Output() selected = new Subject<User>();

  constructor() { }

  ngOnInit() {

  }

}
