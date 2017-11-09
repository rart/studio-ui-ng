import {
  Component,
  Input,
  OnInit,
  OnChanges,
  Output,
  EventEmitter
} from '@angular/core';
import {User} from '../../../models/user.model';
import {SiteService} from '../../../services/site.service';
import {GroupService} from '../../../services/group.service';
import {Site} from '../../../models/site.model';
import {Change, ChangeTracker, ChangeTrackerType, ChangeType} from '../../../classes/change-tracker';

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
  sitesLoaded = false;
  groupsLoaded = false;
  notAMemberGroupsBySite;

  sites;

  constructor(
    public siteService: SiteService,
    public groupService: GroupService) { }

  ngOnInit() {
    this.siteService
      .all()
      .then((data) => {
        this.sitesLoaded = true;
        this.mergeSites(data.entries);
        this.setNotAMemberGroupBySite();
      });
    this.groupService
      .allBySite()
      .then((data) => {
        this.groupsLoaded = true;
        this.mergeSites(data.sites);
        this.setNotAMemberGroupBySite();
      });
  }

  ngOnChanges() {
    if (this.changeRollBack) {
      let change = this.changeRollBack as Change;
      let site = this.findSiteByCode(change.value.siteCode);
      let group = site.groups.filter((g) => g.name === change.value.groupName)[0];
      if (change.type === ChangeType.Add) {
        this.removeFromGroup(site, group, true);
      } else /* if (change.type === ChangeType.Remove) */ {
        this.addToGroup(site, group, true);
      }
      // this.changeRollBack = null;
    }
  }

  setNotAMemberGroupBySite() {
    if (this.sitesLoaded && this.groupsLoaded) {
      let notAMemberGroupsBySite = {};
      this.sites.forEach((site) => {
        // site Not A Member Groups (NMG)
        let siteNMG = this.getUserNotAMemberGroupsBySite(site);
        notAMemberGroupsBySite[site.code] = siteNMG;
      });
      this.notAMemberGroupsBySite = notAMemberGroupsBySite;
    }
  }

  hasSite(siteCode) {
    if (this.user && this.user.sites) {
      const result = this.user.sites.filter((site) => site.code === siteCode);
      return result.length > 0;
    }
    return false;
  }

  findSiteByCode(code) {
    return this.sites.filter((site) => site.code === code)[0];
  }

  findSiteInUser(site) {
    let user = this.user,
      userSites = user.sites;
    for (let i = 0, l = userSites.length; i < l; ++i) {
      if (userSites[i].code === site.code) {
        return userSites[i];
      }
    }
  }

  findGroupInUser(site) {

  }

  getUserGroupsBySite(site) {
    let user = this.user,
      userGroups = user.groups;
    if (!userGroups || userGroups.length === 0) {
      return [];
    } else {
      return userGroups.filter((userGroup) =>
        userGroup.site.code === site.code);
    }
  }

  getUserNotAMemberGroupsBySite(site) {
    let user = this.user,
      userGroups = user.groups,
      siteGroups = site.groups;
    if (userGroups && userGroups.length) {
      let groupsNotMemeberOf = [],
        userGroupsFromSite = userGroups.filter((userGroup) =>
          userGroup.site.code === site.code);
      siteGroups.filter((siteGroup) => {
        let userBelongsToGroup = false;
        for (let i = 0; i < userGroupsFromSite.length; ++i) {
          if (siteGroup.name === userGroupsFromSite[i].name) {
            userBelongsToGroup = true;
            break;
          }
        }
        if (!userBelongsToGroup) {
          groupsNotMemeberOf.push(siteGroup);
        }
      });
      return groupsNotMemeberOf;
    } else {
      return siteGroups;
    }
  }

  addToGroup(site, group, silent = false) {
    let user = this.user;
    user.groups.push(group);
    user.sites.push(site);
    this.setNotAMemberGroupBySite();
    this.trackChange(ChangeType.Add, site.code, group.name, silent);
  }

  removeFromGroup(site, group, silent = false) {

    let user = this.user,
      userSites = user.sites;

    let newGroups = user.groups.filter((userGroup) => {
      return (userGroup.name !== group.name) ||
        (userGroup.site.code !== site.code);
    });

    let stillBelongsToSite = false;
    for (let i = 0, l = newGroups.length; i < l; ++i) {
      if (newGroups[i].site.code === site.code) {
        stillBelongsToSite = true;
        break;
      }
    }

    if (!stillBelongsToSite) {
      user.sites = user.sites.filter((userSite) =>
        userSite.code !== site.code);
    }

    user.groups = newGroups;
    this.setNotAMemberGroupBySite();
    this.trackChange(ChangeType.Remove, site.code, group.name, silent);

  }

  // TODO API needs change. Update when changed.
  // this should be not needed once the API supports
  // fetching site with it's respective groups.
  mergeSites(fetchedSites: Site[]) {
    let sites: Site[] = this.sites;
    if (sites) {
      let sitesMap = {};
      let fetchedSitesMap = {};
      sites.forEach(site => {
        sitesMap[site.code] = site;
      });
      fetchedSites.forEach(site => {
        fetchedSitesMap[site.code] = site;
      });
      sites.forEach(site => {
        if (!fetchedSitesMap[site.code]) {
          fetchedSitesMap[site.code] = site;
          fetchedSites.push(site);
        }
      });
      fetchedSites.forEach(site => {
        if (!sitesMap[site.code]) {
          sitesMap[site.code] = site;
          sites.push(site);
        }
      });
      sites.forEach(site => {
        site.completeMissingInformation(fetchedSitesMap[site.code]);
        fetchedSitesMap[site.code].completeMissingInformation(site);
      });
      // console.log(sites, fetchedSites);
      // For some reason the sites/all call returns more results
      // than group/bySite call; so now that both array of sites
      // are complete in info and number of sites...
    } else {
      this.sites = fetchedSites;
    }
  }

  trackChange(type: ChangeType, siteCode, groupName, silent = false) {
    if (!this.changeTracker) {
      this.changeTracker = ChangeTracker.create(ChangeTrackerType.ADD_REMOVE, (v1, v2) => {
        return (v1.siteCode === v2.siteCode) &&
          (v1.groupName === v2.groupName);
      });
    }
    let tracker = this.changeTracker;
    let value = { siteCode, groupName };
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
