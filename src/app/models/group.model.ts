import {Project} from './project.model';
import { parseEntity } from '../utils/api.utils';

export class Group {
  id;
  // projectCode;
  name;
  project: Project;
  // roles

  static toJSON() {
    //  TODO: Implement toJSON for Group?
  }

  static deserialize(json): Group {
    if (json === undefined || json === null) {
      return null;
    }
    let model = new Group();
    Object.keys(json).forEach(prop => {
      model[prop] = (prop === 'project') ? Project.deserialize(json[prop]) : json[prop];
    });
    return model;
  }
}
