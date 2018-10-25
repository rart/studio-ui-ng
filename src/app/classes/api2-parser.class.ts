
import { Asset } from '../models/asset.model';
import { Group } from '../models/group.model';
import { Project } from '../models/project.model';
import { User } from '../models/user.model';
import { getRandomAvatar } from '../app.utils';

export class API2Parser {
  static asset(json: any): Asset {
    if (json == null) {
      return null;
    }
    return undefined;
  }

  static group(json: any): Group {
    if (json == null) {
      return null;
    }
    return {
      id: json.id,
      name: json.name,
      description: json.desc
    };
  }

  static project(json: any): Project {
    if (json == null) {
      return null;
    }
    return undefined;
  }

  static user(json: any): User {
    if (json == null) {
      return null;
    }
    return {
      id: json.id,
      firstName: json.firstName,
      lastName: json.lastName,
      password: null,
      username: json.username,
      externallyManaged: json.externallyManaged,
      authenticationType: json.authenticationType,
      avatarUrl: getRandomAvatar(),
      email: json.email,
      enabled: json.enabled
    };
  }

}

export class API2Serializer {
  static group(group: Group) {
    return {
      id: group.id,
      name: group.name,
      desc: group.description
    };
  }
}
