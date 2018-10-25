import {
  Component,
  Input,
  OnInit,
  OnChanges,
  Output,
  EventEmitter
} from '@angular/core';
import { User } from '../../../models/user.model';
import { ProjectService } from '../../../services/project.service';
import { GroupService } from '../../../services/group.service';
import { Project } from '../../../models/project.model';
import { Change, ChangeTracker, ChangeTrackerType, ChangeType } from '../../../classes/change-tracker.class';
import { combineLatest } from 'rxjs/operators';

@Component({
  selector: 'std-user-group-manager',
  templateUrl: './user-group-manager.component.html',
  styleUrls: ['./user-group-manager.component.scss']
})
export class UserGroupManagerComponent implements OnInit, OnChanges {

  @Input() user: User;
  @Input() changeRollBack: Change;
  @Output() change = new EventEmitter();

  changeTracker;
  dataFetchComplete = false;
  notAMemberGroupsByProject;

  projects;

  constructor(public projectService: ProjectService,
              public groupService: GroupService) {
  }

  ngOnInit() {
    this.projectService
      .page()
      .pipe(
        combineLatest(this.groupService.byProject(), (projectsData, groupsData) => {
          return this.mergeProjectsAndGroupsResponses(
            projectsData.entries,
            groupsData.projects);
        })
      )
      .subscribe(projects => {
        this.projects = projects;
        this.dataFetchComplete = true;
        this.setNotAMemberGroupByProject();
      });
  }

  ngOnChanges() {
    if (this.changeRollBack) {
      let change = this.changeRollBack as Change;
      let project = this.findProjectByCode(change.value.projectCode);
      let group = project.groups.filter((g) => g.name === change.value.groupName)[0];
      if (change.type === ChangeType.Add) {
        this.removeFromGroup(project, group, true);
      } else /* if (change.type === ChangeType.Remove) */ {
        this.addToGroup(project, group, true);
      }
      // this.changeRollBack = null;
    }
  }

  setNotAMemberGroupByProject() {
    if (this.dataFetchComplete) {
      let notAMemberGroupsByProject = {};
      this.projects.forEach((project) => {
        // project Not A Member Groups (NMG)
        let projectNMG = this.getUserNotAMemberGroupsByProject(project);
        notAMemberGroupsByProject[project.code] = projectNMG;
      });
      this.notAMemberGroupsByProject = notAMemberGroupsByProject;
    }
  }

  hasProject(projectCode) {
    // if (this.user && this.user.projects) {
    //   const result = this.user.projects.filter((project) => project.code === projectCode);
    //   return result.length > 0;
    // }
    return false;
  }

  findProjectByCode(code) {
    return this.projects.filter((project) => project.code === code)[0];
  }

  findProjectInUser(project) {
    let user = this.user,
      userProjects = []; // user.projects;
    for (let i = 0, l = userProjects.length; i < l; ++i) {
      if (userProjects[i].code === project.code) {
        return userProjects[i];
      }
    }
  }

  findGroupInUser(project) {

  }

  getUserGroupsByProject(project) {
    let user = this.user,
      userGroups = []; // user.groups;
    if (!userGroups || userGroups.length === 0) {
      return [];
    } else {
      return userGroups.filter((userGroup) =>
        userGroup.project.code === project.code);
    }
  }

  getUserNotAMemberGroupsByProject(project) {
    let
      user = this.user,
      userGroups = [], // user.groups,
      projectGroups = project.groups;
    if (userGroups && projectGroups && userGroups.length && projectGroups.length) {
      let groupsNotMemeberOf = [],
        userGroupsFromProject = userGroups.filter((userGroup) =>
          userGroup.project.code === project.code);
      projectGroups.filter((projectGroup) => {
        let userBelongsToGroup = false;
        for (let i = 0; i < userGroupsFromProject.length; ++i) {
          if (projectGroup.name === userGroupsFromProject[i].name) {
            userBelongsToGroup = true;
            break;
          }
        }
        if (!userBelongsToGroup) {
          groupsNotMemeberOf.push(projectGroup);
        }
      });
      return groupsNotMemeberOf;
    } else {
      return projectGroups || [];
    }
  }

  addToGroup(project, group, silent = false) {
    let user = this.user;
    // user.groups.push(group);
    // user.projects.push(project);
    this.setNotAMemberGroupByProject();
    this.trackChange(ChangeType.Add, project.code, group.name, silent);
  }

  removeFromGroup(project, group, silent = false) {

    let user = this.user,
      userProjects = []; // user.projects;

    let newGroups = []; /*user.groups.filter((userGroup) => {
      return (userGroup.name !== group.name) ||
        (userGroup.project.code !== project.code);
    });*/

    let stillBelongsToProject = false;
    for (let i = 0, l = newGroups.length; i < l; ++i) {
      if (newGroups[i].project.code === project.code) {
        stillBelongsToProject = true;
        break;
      }
    }

    if (!stillBelongsToProject) {
      // user.projects = user.projects.filter((userProject) =>
      //   userProject.code !== project.code);
    }

    // user.groups = newGroups;
    this.setNotAMemberGroupByProject();
    this.trackChange(ChangeType.Remove, project.code, group.name, silent);

  }

  // TODO API needs change. Update when changed.
  // this should be not needed once the API supports
  // fetching project with it's respective groups.
  mergeProjectsAndGroupsResponses(projects: Project[], groupProjects: Project[]) {
    let projectsMap = {};
    let groupProjectsMap = {};
    groupProjects.forEach(project => {
      groupProjectsMap[project.code] = project;
    });
    projects.forEach(project => {
      projectsMap[project.code] = project;
      if (!groupProjectsMap[project.code]) {
        groupProjectsMap[project.code] = project;
        groupProjects.push(project);
      }
    });
    groupProjects.forEach(project => {
      if (!projectsMap[project.code]) {
        projectsMap[project.code] = project;
        projects.push(project);
      }
    });
    projects.forEach(project => {
      project.completeMissingInformation(groupProjectsMap[project.code]);
      groupProjectsMap[project.code].completeMissingInformation(project);
    });
    // console.log(projects, groupProjects);
    // For some reason the sites/all call returns more results
    // than group/bySite call; so now that both array of sites
    // are complete in info and number of projects...
    return projects;
  }

  trackChange(type: ChangeType, projectCode, groupName, silent = false) {
    if (!this.changeTracker) {
      this.changeTracker = ChangeTracker.create(ChangeTrackerType.ADD_REMOVE, (v1, v2) => {
        return (v1.projectCode === v2.projectCode) &&
          (v1.groupName === v2.groupName);
      });
    }
    let tracker = this.changeTracker;
    let value = { projectCode, groupName };
    let change = { type, value };
    tracker.track(change);
    if (!silent) {
      this.change.emit({
        change: change,
        hasChanges: tracker.hasChanges()
      });
    }
  }
}
