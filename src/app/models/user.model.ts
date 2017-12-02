import { Site } from './site.model';
import { Group } from './group.model';
import { AVATARS } from '../app.utils';

export interface UserProps {
  avatarUrl?: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  managedExternally?: boolean;
  enabled?: boolean;
  sites?: Array<Site>;
  groups?: Array<Group>;
}

export class User implements UserProps {
  avatarUrl: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  managedExternally: boolean;
  enabled: boolean;
  sites: Array<Site>;
  groups: Array<Group>;
  password: string;

  // permissions...
  // roles: Array<Roles>;
  // role => permission
  // groups can have permission, roles
  // user can have permissions, roles, groups

  get name() {
    return this.firstName || this.lastName ? `${this.firstName} ${this.lastName}` : this.username;
  }

  static fromJSON(userJSON): User {
    let user = new User();
    user.username = userJSON.username;
    user.email = userJSON.email;
    user.firstName = userJSON.first_name;
    user.lastName = userJSON.last_name;
    user.managedExternally = userJSON.externally_managed;
    user.enabled = userJSON.enabled || false;
    user.sites = [];
    user.groups = [];

    user.avatarUrl = AVATARS[Math.floor(Math.random() * 11)];

    // When fetching a user model, the API returns the groups the
    // user belongs to inside of the site. Instead of the groups that
    // belong to the site. Here, site.groups are set to null and user.groups
    // are set to the site.groups that come from API
    if (userJSON.sites && userJSON.sites.length) {

      let userGroups = [];

      user.sites = userJSON.sites.map((siteJSON) => {
        let site = Site.fromJSON(siteJSON);
        userGroups = userGroups.concat(
          siteJSON.groups.map((groupJSON) => {
            let group = Group.fromJSON(groupJSON);
            group.site = site;
            return group;
          })
        );
        site.groups = null;
        return site;
      });

      user.groups = userGroups;

    }

    return user;
  }

  static toJSON(user) {
    let json = {
      username: user.username,
      email: user.email,
      first_name: user.firstName,
      last_name: user.lastName,
      externally_managed: user.managedExternally
    };
    if (user.password) {
      json['password'] = user.password;
    }
    return json;
  }

  static deserialize(json: any): User {
    if (json === undefined || json === null) {
      return null;
    }
    let model = new User();
    Object.keys(json).forEach(prop => {
      if (prop === 'sites') {
        model[prop] = json.sites ? json.sites.map(siteJson => Site.deserialize(siteJson)) : null;
      } else if (prop === 'groups') {
        model[prop] = json.groups ? json.groups.map(groupJson => Group.deserialize(groupJson)) : null;
      } else {
        model[prop] = json[prop];
      }
    });
    return model;
  }

  export() {
    return User.toJSON(this);
  }
}
