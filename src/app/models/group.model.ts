import {Site} from './site.model';

export class Group {
  id;
  // siteCode;
  name;
  site: Site;
  // roles

  static fromJSON(json) {
    let model = new Group();
    model.id = json.group_id;
    model.name = json.group_name;
    model.site = (json.site) ? Site.fromJSON(json) : undefined;
    // model.siteCode = (json.site) ? Site.fromJSON(json) : undefined;
    return model;
  }

  static toJSON() {
    //  TODO: Implement toJSON for Group?
  }

  static deserialize(json): Group {
    if (json === undefined || json === null) {
      return null;
    }
    let model = new Group();
    Object.keys(json).forEach(prop => {
      model[prop] = (prop === 'site') ? Site.deserialize(json[prop]) : json[prop];
    });
    return model;
  }
}
