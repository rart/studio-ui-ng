import {Site} from './site';

export class Group {
  id;
  // siteCode;
  name;
  site: Site;
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
}
