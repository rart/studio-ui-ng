
import {Group} from './group.model';

export class Project {
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

  static deserialize(json): Project {
    if (json === undefined || json === null) {
      return null;
    }
    let model = new Project();
    Object.keys(json).forEach(prop => {
      model[prop] = (prop === 'groups') ? Group.deserialize(json[prop]) : json[prop];
    });
    return model;
  }

  /**
   * Takes any info from `completer` and sets it to this instance. Does
   * not override any existing values on present instance.
   **/
  completeMissingInformation(completer: Project): void {
    let properties = Object.keys(completer);
    properties.forEach(propertyName => {
      this[propertyName] = this[propertyName] || completer[propertyName];
    });
  }
}

