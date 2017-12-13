import { Project } from './project.model';
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
  projects?: Array<Project>;
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
  projects: Array<Project>;
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
      if (prop === 'projects') {
        model[prop] = json.projects ? json.projects.map(projectJson => Project.deserialize(projectJson)) : null;
      } else if (prop === 'groups') {
        model[prop] = json.groups ? json.groups.map(groupJson => Group.deserialize(groupJson)) : null;
      } else {
        model[prop] = json[prop];
      }
    });
    model.firstName = model.firstName + '';
    model.lastName = model.lastName + '';
    return model;
  }

  export() {
    return User.toJSON(this);
  }
}
