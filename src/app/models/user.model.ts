
import {Site} from './site.model';
import {Group} from './group.model';
import {environment} from '../../environments/environment';

// Avatars from semantic-ui.com
// https://semantic-ui.com/images/avatar2/large/kristy.png
// https://semantic-ui.com/images/avatar/large/elliot.jpg
// https://semantic-ui.com/images/avatar/large/jenny.jpg
// https://semantic-ui.com/images/avatar2/large/matthew.png
// https://semantic-ui.com/images/avatar2/large/molly.png
// https://semantic-ui.com/images/avatar2/large/elyse.png
// https://semantic-ui.com/images/avatar/large/steve.jpg
// https://semantic-ui.com/images/avatar/large/daniel.jpg
// https://semantic-ui.com/images/avatar/large/helen.jpg
// https://semantic-ui.com/images/avatar/large/matt.jpg
// https://semantic-ui.com/images/avatar/large/veronika.jpg
// https://semantic-ui.com/images/avatar/large/stevie.jpg

const avatarsURL = `${environment.assetsUrl}/img/avatars`;

export const AVATARS = [
  `${avatarsURL}/daniel.jpg`,
  `${avatarsURL}/elyse.png`,
  `${avatarsURL}/jenny.jpg`,
  `${avatarsURL}/matt.jpg`,
  `${avatarsURL}/molly.png`,
  `${avatarsURL}/stevie.jpg`,
  `${avatarsURL}/elliot.jpg`,
  `${avatarsURL}/helen.jpg`,
  `${avatarsURL}/kristy.png`,
  `${avatarsURL}/matthew.png`,
  `${avatarsURL}/steve.jpg`,
  `${avatarsURL}/veronika.jpg`
];

const MALE = [
  `${avatarsURL}/daniel.jpg`,
  `${avatarsURL}/matt.jpg`,
  `${avatarsURL}/stevie.jpg`,
  `${avatarsURL}/elliot.jpg`,
  `${avatarsURL}/matthew.png`,
  `${avatarsURL}/steve.jpg`
];

const FEMALE = [
  `${avatarsURL}/elyse.png`,
  `${avatarsURL}/jenny.jpg`,
  `${avatarsURL}/molly.png`,
  `${avatarsURL}/helen.jpg`,
  `${avatarsURL}/kristy.png`,
  `${avatarsURL}/veronika.jpg`
];

export class User {
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

    user.avatarUrl = AVATARS[ Math.floor(Math.random() * 11) ];

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
  export() {
    return User.toJSON(this);
  }
}
