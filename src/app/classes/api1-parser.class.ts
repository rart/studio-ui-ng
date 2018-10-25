import { AssetTypeEnum } from '../enums/asset-type.enum';
import { WorkflowStatusEnum } from '../enums/workflow-status.enum';
import { MimeTypeEnum } from '../enums/mime-type.enum';
import { Asset } from '../models/asset.model';
import { User } from '../models/user.model';
import { Group } from '../models/group.model';
import { Project } from '../models/project.model';
import { getRandomAvatar } from '../app.utils';
import { APIParser } from './api-parser.abstract';

export class API1Parser extends APIParser {

  constructor() {
    super();
  }

  static asset(json: any): Asset {
    let
      user: any = {},
      asset = new Asset(),
      hasLock = (json.lockOwner !== null && json.lockOwner !== undefined && json.lockOwner !== '');

    asset.lastEditedBy = null;
    if (json.user !== null && json.user !== undefined) {
      user.username = json.user || '';
      user.firstName = json.userFirstName || '';
      user.lastName = json.userLastName || '';
      asset.lastEditedBy = user;
    }

    asset.lockedBy = null;
    if (hasLock) {
      user.username = json.lockOwner || '';
      user.firstName = '';
      user.lastName = '';
      asset.lockedBy = user;
    }

    asset.label = json.internalName || json.name || (json.uri === '/' && json.site) || '';

    asset.children = (json.children && json.children.length)
      ? json.children
      // Get rid of crafter-component.xml
        .filter(jsonItem => jsonItem.name !== 'crafter-component.xml')
        // Convert all children to Asset type
        .map(itemJSON => API1Parser.asset(itemJSON))
      : null;

    asset.id = `${json.site}:${json.uri || json.path}`;
    asset.path = json.path;
    asset.fileName = json.name;
    asset.lastEditedOn = json.lastEditDate || json.eventDate;
    asset.url = (json.browserUri === '') ? '/' : json.browserUri;
    asset.projectCode = json.site;
    asset.numOfChildren = json.numOfChildren;
    asset.contentModelId = json.form;
    asset.renderingTemplates = json.renderingTemplates;

    // api not sending proper mime type for woff2
    // it's giving same mime as "folders" (octet-stream)
    // so currently acknowledging woff2 by extensions
    if (asset.label.endsWith('.woff2')) {
      asset.mimeType = MimeTypeEnum.WOFF2;
    } else if (asset.label.endsWith('.scss')) {
      asset.mimeType = MimeTypeEnum.SCSS;
    } else if (asset.label.endsWith('.sass')) {
      asset.mimeType = MimeTypeEnum.SASS;
    } else if (asset.label.endsWith('.less')) {
      asset.mimeType = MimeTypeEnum.LESS;
    } else {
      asset.mimeType = json.mimeType;
    }

    asset.type = AssetTypeEnum.UNKNOWN;
    asset.workflowStatus = WorkflowStatusEnum.UNKNOWN;

    if (asset.label === 'crafter-level-descriptor.level.xml') {
      asset.type = AssetTypeEnum.LEVEL_DESCRIPTOR;
    } else if (asset.mimeType === MimeTypeEnum.WOFF2) {
      // see comment above
      asset.type = AssetTypeEnum.WOFF2_FONT;
    } else if (asset.mimeType === MimeTypeEnum.SCSS) {
      asset.type = AssetTypeEnum.SCSS;
    } else if (asset.mimeType === MimeTypeEnum.SASS) {
      asset.type = AssetTypeEnum.SASS;
    } else if (asset.mimeType === MimeTypeEnum.LESS) {
      asset.type = AssetTypeEnum.LESS;
    } else {
      switch (json.mimeType) {
        case MimeTypeEnum.JSON:
          asset.type = AssetTypeEnum.JSON;
          break;
        case MimeTypeEnum.HTML:
          asset.type = AssetTypeEnum.HTML;
          break;
        case MimeTypeEnum.MPEG:
          asset.type = AssetTypeEnum.MPEG;
          break;
        case MimeTypeEnum.SVG:
          asset.type = AssetTypeEnum.SVG;
          break;
        case MimeTypeEnum.JPEG:
          asset.type = AssetTypeEnum.JPEG;
          break;
        case MimeTypeEnum.GIF:
          asset.type = AssetTypeEnum.GIF;
          break;
        case MimeTypeEnum.PNG:
          asset.type = AssetTypeEnum.PNG;
          break;
        case MimeTypeEnum.MP4:
          asset.type = AssetTypeEnum.MP4;
          break;
        case MimeTypeEnum.JAVASCRIPT:
          asset.type = AssetTypeEnum.JAVASCRIPT;
          break;
        case MimeTypeEnum.GROOVY:
          asset.type = AssetTypeEnum.GROOVY;
          break;
        case MimeTypeEnum.CSS:
          asset.type = AssetTypeEnum.CSS;
          break;
        case MimeTypeEnum.FREEMARKER:
          asset.type = AssetTypeEnum.FREEMARKER;
          break;
        case MimeTypeEnum.EOT:
          asset.type = AssetTypeEnum.EOT_FONT;
          break;
        case MimeTypeEnum.OTF:
          asset.type = AssetTypeEnum.OTF_FONT;
          break;
        case MimeTypeEnum.TTF:
          asset.type = AssetTypeEnum.TTF_FONT;
          break;
        case MimeTypeEnum.WOFF:
          asset.type = AssetTypeEnum.WOFF_FONT;
          break;
        // case MimeTypeEnum.FOLDER:
        //   asset.type = AssetTypeEnum.FOLDER;
        //   break;
        default:
          if (json.folder) {
            asset.type = AssetTypeEnum.FOLDER;
          } else if (json.page) {
            asset.type = AssetTypeEnum.PAGE;
          } else if (json.component) {
            asset.type = AssetTypeEnum.COMPONENT;
          } else if (json.document) {
            asset.type = AssetTypeEnum.DOCUMENT;
          } else if (json.levelDescriptor) {
            asset.type = AssetTypeEnum.LEVEL_DESCRIPTOR;
          } else if (json.asset) {
            asset.type = AssetTypeEnum.ASSET;
          }
      }
    }

    if (json.new) {
      if (json.deleted) {
        asset.workflowStatus = WorkflowStatusEnum.NEW_DELETED;
      } else if (hasLock) {
        if (json.submitted) {
          if (json.scheduled) {
            asset.workflowStatus = WorkflowStatusEnum.NEW_SUBMITTED_WITH_WF_SCHEDULED_LOCKED; // Waiting for approval
          } else {
            asset.workflowStatus = WorkflowStatusEnum.NEW_SUBMITTED_WITH_WF_UNSCHEDULED_LOCKED;
          }
        } else if (json.scheduled) {
          asset.workflowStatus = WorkflowStatusEnum.NEW_SUBMITTED_NO_WF_SCHEDULED_LOCKED; // Already approved
        } else {
          asset.workflowStatus = WorkflowStatusEnum.NEW_UNPUBLISHED_LOCKED;
        }
      } else /* UNLOCKED */ {
        if (json.submitted) {
          if (json.scheduled) {
            asset.workflowStatus = WorkflowStatusEnum.NEW_SUBMITTED_WITH_WF_SCHEDULED;
          } else {
            asset.workflowStatus = WorkflowStatusEnum.NEW_SUBMITTED_WITH_WF_UNSCHEDULED;
          }
        } else if (json.scheduled) {
          asset.workflowStatus = WorkflowStatusEnum.NEW_SUBMITTED_NO_WF_SCHEDULED;
        } else if (json.inFlight) {
          asset.workflowStatus = WorkflowStatusEnum.NEW_SUBMITTED_NO_WF_UNSCHEDULED;
        } else {
          asset.workflowStatus = WorkflowStatusEnum.NEW_UNPUBLISHED_UNLOCKED;
        }
      }
    } else /* existing */ {
      if (json.deleted) {
        asset.workflowStatus = WorkflowStatusEnum.EXISTING_DELETED;
      } else if (hasLock) {
        if (json.submitted) {
          if (json.scheduled) {
            asset.workflowStatus = WorkflowStatusEnum.EXISTING_SUBMITTED_WITH_WF_SCHEDULED_LOCKED;
          } else {
            asset.workflowStatus = WorkflowStatusEnum.EXISTING_SUBMITTED_WITH_WF_UNSCHEDULED_LOCKED;
          }
        } else if (json.scheduled) {
          asset.workflowStatus = WorkflowStatusEnum.EXISTING_SUBMITTED_NO_WF_SCHEDULED_LOCKED;
        } else if (json.live) {
          asset.workflowStatus = WorkflowStatusEnum.EXISTING_UNEDITED_LOCKED;
        } else if (json.inProgress) {
          asset.workflowStatus = WorkflowStatusEnum.EXISTING_EDITED_LOCKED;
        }
      } else {
        if (json.submitted) {
          if (json.scheduled) {
            asset.workflowStatus = WorkflowStatusEnum.EXISTING_SUBMITTED_WITH_WF_SCHEDULED;
          } else {
            asset.workflowStatus = WorkflowStatusEnum.EXISTING_SUBMITTED_WITH_WF_UNSCHEDULED;
          }
        } else if (json.scheduled) {
          asset.workflowStatus = WorkflowStatusEnum.EXISTING_SUBMITTED_NO_WF_SCHEDULED;
        } else if (json.live) {
          asset.workflowStatus = WorkflowStatusEnum.EXISTING_UNEDITED_UNLOCKED;
        } else if (json.inProgress) {
          asset.workflowStatus = WorkflowStatusEnum.EXISTING_EDITED_UNLOCKED;
        } else if (json.inFlight) {
          asset.workflowStatus = WorkflowStatusEnum.EXISTING_SUBMITTED_NO_WF_UNSCHEDULED;
        }
      }
    }

    // asset.workflowStatus = WorkflowStatusEnum.NEW_PUBLISHING_FAILED; ????
    // asset.workflowStatus = WorkflowStatusEnum.EXISTING_PUBLISHING_FAILED;  ????

    return asset;
  }

  static user(json: any): User {

    let user: User = {
      id: json.id,
      username: json.username,
      email: json.email,
      firstName: json.first_name,
      lastName: json.last_name,
      externallyManaged: json.externally_managed,
      enabled: json.enabled || false,
      avatarUrl: getRandomAvatar(),
      authenticationType: json.authentication_type || json.authenticationType
    };

    // When fetching a user model, the API returns the groups the
    // user belongs to inside of the project. Instead of the groups that
    // belong to the project. Here, project.groups are set to null and user.groups
    // are set to the project.groups that come from API
    // json.projects.forEach((projectJSON) => {
    //   user.groups.concat(projectJSON.groups.map((groupJSON) => API1Parser.group(groupJSON).id));
    // });

    return user;
  }

  static group(json: any): Group {
    return {
      id: json.group_id,
      name: json.group_name,
      description: json.desc
    };
  }

  static project(json: any): Project {
    let project = new Project();
    project.id = json.id;
    project.code = json.siteId || json.site_id;
    project.name = json.name || json.site_name;
    project.description = json.description;
    project.status = json.status;
    project.liveUrl = json.liveUrl;
    project.lastCommitId = json.lastCommitId;
    project.publishingEnabled = json.publishingEnabled;
    project.publishingStatusMessage = json.publishingStatusMessage;
    project.groups = /*(json.groups && json.groups.length)
      ? json.groups.map((groupJSON) => {
        let group = API1Parser.group(groupJSON);
        group.project = project;
        return group;
      })
      : */undefined;
    return project;
  }

  protected asset(json: any): Asset {
    return API1Parser.asset(json);
  }

  protected group(json: any): Group {
    return API1Parser.group(json);
  }

  protected project(json: any): Project {
    return API1Parser.project(json);
  }

  protected user(json: any): User {
    return API1Parser.user(json);
  }


}
