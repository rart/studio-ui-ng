import {Component, OnDestroy, OnInit} from '@angular/core';
import {DataSource} from '@angular/cdk/collections';
import {Observable} from 'rxjs/Observable';
import 'rxjs/add/observable/of';
import 'rxjs/add/observable/fromEvent';
import 'rxjs/add/observable/defer';
import 'rxjs/add/operator/delay';
import {Router} from '@angular/router';
import {MatDialogConfig, PageEvent} from '@angular/material';
import {ActivatedRoute} from '@angular/router';
import {MatDialog, MatDialogRef, MAT_DIALOG_DATA} from '@angular/material';
import {UserService} from '../../services/user.service';
import {UserManagementDialogComponent} from './user-management-dialog/user-management-dialog.component';
import {openDialog} from "../../app.utils";

declare var $;

@Component({
  selector: 'std-user-management',
  templateUrl: './user-management.component.html',
  styleUrls: ['./user-management.component.scss']
})
export class UserManagementComponent implements OnInit {
  subs;
  users;
  pageSize = 5;
  pageIndex = 0;
  totalNumOfUsers = 0;
  pageSizeOptions = [5, 10, 25, 100];

  constructor(private userService: UserService,
              private activeRoute: ActivatedRoute,
              public dialog: MatDialog,
              public router: Router) {
    // Take advantage or be respectful of client screen by
    // showing more or less results
    this.pageSize = ($(window).height() > 600)
      ? this.pageSizeOptions[1]
      : this.pageSizeOptions[0];
    /*
    this.subs = Observable.fromEvent(window, 'resize')
      .delay(500)
      .subscribe((e) => console.log(e)); */
  }

  ngOnInit() {
    this.activeRoute.queryParams.subscribe(params => {
      const pageSize = params['pageSize'];
      const pageIndex = params['pageIndex'];
      const create = params['create'];
      const edit = params['edit'];
      const state = {
        pageSize: this.pageSize,
        pageIndex: this.pageIndex,
        users: this.users
      };

      if (pageSize !== undefined) { this.pageSize = pageSize; }
      if (pageIndex !== undefined) { this.pageIndex = pageIndex; }

      // TODO: fetch only when changed
      this.fetchUsers();

      // Something fails when opening dialogs without the setTimeout

      if (create !== undefined) {
        setTimeout(() => this.openDialog());
      }

      if (edit !== undefined && edit !== '') {
        setTimeout(() => this.openDialog({ username: edit }));
      }

    });
  }

  fetchUsers() {
    this.userService.all({
      start: (this.pageIndex * this.pageSize),
      number: this.pageSize
    }).then((data) => {
      this.users = data.users;
      this.totalNumOfUsers = data.total;
    });
  }

  createUser() {
    this.router.navigate(['/users'], { queryParams: { create: 'true' } });
  }

  openDialog(data?) {
    let dialogRef = openDialog(this.dialog, UserManagementDialogComponent, {
      width: '800px',
      disableClose: true,
      data: data || {}
    });
  }

  pageChanged($event: PageEvent) {
    this.router.navigate(['/users'], {
      queryParams: { pageIndex: $event.pageIndex, pageSize: $event.pageSize }
    });
  }

}
