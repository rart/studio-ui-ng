import { Component, EventEmitter, OnDestroy, OnInit, Output } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { GroupService } from '../../../services/group.service';
import { UserService } from '../../../services/user.service';
import { ActivatedRoute, Router } from '@angular/router';
import { MatSnackBar } from '@angular/material';
import { SiteService } from '../../../services/site.service';
import { Site } from '../../../models/site.model';
import { StringUtils } from '../../../utils/string.utils';
import { CommunicationService } from '../../../services/communication.service';
import { WindowMessageTopicEnum } from '../../../enums/window-message-topic.enum';
import { WindowMessageScopeEnum } from '../../../enums/window-message-scope.enum';
import { showSnackBar } from '../../../utils/material.utils';

@Component({
  selector: 'std-site-crud',
  templateUrl: './site-crud.component.html',
  styleUrls: ['./site-crud.component.scss']
})
export class SiteCrUDComponent implements OnInit, OnDestroy {

  @Output() finished = new EventEmitter();

  editMode = false;
  creationRequestPending = false;
  runCreationInBackground = false;

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

  constructor(private router: Router,
              private route: ActivatedRoute,
              public snackBar: MatSnackBar,
              public userService: UserService,
              public groupService: GroupService,
              public siteService: SiteService,
              private communicationService: CommunicationService) {
  }

  ngOnInit() {

    this.loadBlueprints();

    const subscriber = (params) => {
      if (params.siteCode || params.edit) {
        this.model.code = params.siteCode || params.edit;
        this.loadSite();
      }
    };

    this.route.url
    // @see https://github.com/angular/angular/issues/20299
      .subscribe(() => {
        let firstChild = this.route.firstChild;
        while (firstChild && firstChild.firstChild) {
          firstChild = firstChild.firstChild;
        }
        if (firstChild) {
          firstChild.params
            .subscribe(subscriber);
          firstChild.queryParams
            .subscribe(subscriber);
        }
      });

  }

  ngOnDestroy() {

  }

  loadSite() {
    this.siteService
      .byId(this.model.code)
      .subscribe((site) => {
        this.model = site;
        this.editMode = true;
        // if (this.blueprints.length) {}
      });
  }

  loadBlueprints() {
    this.siteService
      .allBlueprints()
      .subscribe((blueprints) => {
        this.blueprints = blueprints;
        this.model.blueprint = blueprints[0];
      });
  }

  autoSiteCode() {
    this.model.name = StringUtils.capitalizeWords(this.model.name || '');
    this.model.code = ((this.model.name || '')
      .replace(/\s+/g, '-')
      .toLowerCase());
  }

  create() {

    const closure = ((instance, router, snackBar, siteCode, siteName) => {
      return () => {
        instance.creationRequestPending = false;
        // if (instance.runCreationInBackground) { } else { }
        // TODO: Go to different place depending on user type?
        showSnackBar(snackBar, `${siteName} site created successfully.`, 'Site Dashboard')
          .onAction()
          .subscribe(() => {
            if (!instance.runCreationInBackground) {
              instance.done();
            }
            router.navigate(['/site', siteCode, 'dashboard']);
          });
        instance.communicationService.publish(
          WindowMessageTopicEnum.SITE_CREATED,
          null, WindowMessageScopeEnum.Local);
      };
    })(this, this.router, this.snackBar, this.model.code, this.model.name);

    this.creationRequestPending = true;
    this.siteService
      .create(this.model)
      .subscribe(closure);

  }

  runSiteCreationInBackground() {
    this.runCreationInBackground = true;
    this.done();
  }

  update() {
    this.siteService
      .update(this.model);
  }

  delete() {
    this.siteService
      .delete(this.model)
      .subscribe(() => {
        this.done();
        showSnackBar(this.snackBar, `${this.model.name} site deleted successfully.`);
      });
  }

  done() {
    this.finished.emit();
  }

}
