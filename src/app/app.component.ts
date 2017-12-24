import { Component, HostBinding, OnInit, ViewEncapsulation } from '@angular/core';
import { StateEntity } from './classes/app-state.interface';
import { select } from '@angular-redux/store';
import { Observable } from 'rxjs/Observable';
import { isNullOrUndefined } from 'util';
import { Project } from './models/project.model';
import { Subject } from 'rxjs/Subject';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'std-app',
  encapsulation: ViewEncapsulation.None,
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {

  @HostBinding('class.sidebar-collapsed')
  sidebarCollapsed = false;

  @select(['entities', 'projects'])
  projectsEntity$: Observable<StateEntity<Project>>;

  @select(['sidebar', 'visible'])
  sidebarVisibility$;

  preRequisitesPassed = false;
  preRequisitesPassed$ = new Subject();

  ngOnInit() {
    this.sidebarVisibility$
      .subscribe((visible: boolean) => this.sidebarCollapsed = !visible);
    this.projectsEntity$
      .pipe(takeUntil(this.preRequisitesPassed$))
      .subscribe(data => {
        if (this.preRequisitesPassed = !isNullOrUndefined(data.byId)) {
          this.preRequisitesPassed$.next();
        }
      });
  }

}
