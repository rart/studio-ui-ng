
import {Group} from './group.model';

export class Site {
  id: string;
  name: string;
  code: string;
  description: string;
  status;
  liveUrl;
  lastCommitId: string;
  publishingEnabled: number;
  publishingStatusMessage: string;
  groups: Array<Group>;
  blueprint: { id, label };
  static fromJSON(siteJSON) {
    let site = new Site();
    site.id = siteJSON.id;
    site.code = siteJSON.siteId || siteJSON.site_id;
    site.name = siteJSON.name || siteJSON.site_name;
    site.description = siteJSON.description;
    site.status = siteJSON.status;
    site.liveUrl = siteJSON.liveUrl;
    site.lastCommitId = siteJSON.lastCommitId;
    site.publishingEnabled = siteJSON.publishingEnabled;
    site.publishingStatusMessage = siteJSON.publishingStatusMessage;
    site.groups = (siteJSON.groups && siteJSON.groups.length)
      ? siteJSON.groups.map((groupJSON) => {
        let group = Group.fromJSON(groupJSON);
        group.site = site;
        return group;
      })
      : undefined;
    return site;
  }

  static deserialize(json): Site {
    if (json === undefined || json === null) {
      return null;
    }
    let model = new Site();
    Object.keys(json).forEach(prop => {
      model[prop] = (prop === 'groups') ? Group.deserialize(json[prop]) : json[prop];
    });
    return model;
  }

  /**
   * Takes any info from `completer` and sets it to this instance. Does
   * not override any existing values on present instance.
   **/
  completeMissingInformation(completer: Site): void {
    let properties = Object.keys(completer);
    properties.forEach(propertyName => {
      this[propertyName] = this[propertyName] || completer[propertyName];
    });
  }
}

