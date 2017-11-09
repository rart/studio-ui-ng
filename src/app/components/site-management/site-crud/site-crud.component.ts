import {Component, EventEmitter, OnDestroy, OnInit, Output} from '@angular/core';
import {FormControl, FormGroup, Validators} from '@angular/forms';
import {GroupService} from '../../../services/group.service';
import {UserService} from '../../../services/user.service';
import {ActivatedRoute, Router} from '@angular/router';
import {MatSnackBar} from '@angular/material';
import {SiteService} from '../../../services/site.service';
import {Site} from '../../../models/site.model';
import {StringUtils} from '../../../app.utils';

@Component({
  selector: 'std-site-crud',
  templateUrl: './site-crud.component.html',
  styleUrls: ['./site-crud.component.scss']
})
export class SiteCrUDComponent implements OnInit, OnDestroy {

  @Output() finished = new EventEmitter();

  editMode = false;
  subscriptions = [];

  model = new Site();

  blueprints = [];

  nameFormControl = new FormControl('', [Validators.required]);
  codeFormControl = new FormControl('', [Validators.required]);
  descriptionFormControl = new FormControl('', []);
  formGroup = new FormGroup({
    name: this.nameFormControl,
    code: this.codeFormControl,
    description: this.descriptionFormControl
  });

  constructor(public snackBar: MatSnackBar,
              private router: Router,
              private route: ActivatedRoute,
              public userService: UserService,
              public groupService: GroupService,
              public siteService: SiteService) {}

  ngOnInit() {

    this.loadBlueprints();

    // @see https://github.com/angular/angular/issues/20299
    this.subscriptions.push(
      this.route.params
        .subscribe(() => {
          let url = this.router.url;
          if (!StringUtils.contains(url, '?')) {
            let siteCode = url
              .replace('/sites/', '')
              .replace('create', '');
            if (siteCode) {
              this.model.code = siteCode;
              this.loadSite();
            }
          }
        }),
      this.route.queryParams
        .subscribe((params) => {
          if (params.edit) {
            this.model.code = params.edit;
            this.loadSite();
          }
        }));

  }

  ngOnDestroy() {
    this.subscriptions.forEach((sub) => sub.unsubscribe());
  }

  loadSite() {
    this.siteService
      .get(this.model.code)
      .then((site) => {
        this.model = site;
        this.editMode = true;
      });
  }

  loadBlueprints() {
    this.siteService
      .allBlueprints()
      .then((blueprints) => this.blueprints = blueprints);
  }

  done() {
    this.finished.emit();
  }

}
