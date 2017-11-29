import { User } from './user.model';
import { WorkflowStatusEnum } from '../enums/workflow-status.enum';
import { AssetTypeEnum } from '../enums/asset-type.enum';
import { MimeTypeEnum } from '../enums/mime-type.enum';

interface RenderingTemplate {
  name: 'DEFAULT' | 'MOBILE';
  internalURI: string;
}

// const reverseMimeMap = {};
// Object.keys(MimeTypeEnum).forEach(type => reverseMimeMap[MimeTypeEnum[type]] = type);

export class Asset {

  id: string;
  url: string;
  label: string;
  contentModelId: string;
  siteCode: string;
  children: Asset[];
  numOfChildren: number;
  lockedBy: User;
  lastEditedBy: User;
  lastEditedOn: string;
  publishedOn: string;
  type: AssetTypeEnum;
  mimeType: string;
  workflowStatus: WorkflowStatusEnum;
  renderingTemplates: RenderingTemplate[];

  get locked(): boolean {
    return this.workflowStatus.endsWith('_LOCKED');
  }

  get hasChildren(): boolean {
    return (this.numOfChildren > 0);
  }

  static fromPO(item: any) {
    return Object.assign(new Asset(), item);
  }

  static fromJSON(json) {

    let
      user,
      asset = new Asset(),
      hasLock = (json.lockOwner !== null && json.lockOwner !== undefined && json.lockOwner !== '');

    asset.lastEditedBy = null;
    if (json.user !== null && json.user !== undefined) {
      user = new User();
      user.username = json.user || '';
      user.firstName = json.userFirstName || '';
      user.lastName = json.userLastName || '';
      asset.lastEditedBy = user;
    }

    asset.lockedBy = null;
    if (hasLock) {
      user = new User();
      user.username = json.lockOwner || '';
      user.firstName = '';
      user.lastName = '';
      asset.lockedBy = user;
    }

    asset.label = json.internalName || json.name;

    asset.children = (json.children && json.children.length)
      ? json.children
        // Get rid of crafter-component.xml
        .filter(jsonItem => jsonItem.name !== 'crafter-component.xml')
        // Convert all children to Asset type
        .map(itemJSON => Asset.fromJSON(itemJSON))
      : null;

    asset.id = json.uri || json.path;
    asset.lastEditedOn = json.lastEditDate || json.eventDate;
    asset.url = (json.browserUri === '') ? '/' : json.browserUri;
    asset.siteCode = json.site;
    asset.numOfChildren = json.numOfChildren;
    asset.contentModelId = json.form;
    asset.renderingTemplates = json.renderingTemplates;

    asset.type = AssetTypeEnum.UNKNOWN;
    asset.workflowStatus = WorkflowStatusEnum.UNKNOWN;

    if (asset.label === 'crafter-level-descriptor.level.xml') {
      asset.type = AssetTypeEnum.LEVEL_DESCRIPTOR;
    } else {
      switch (json.mimeType) {
        case MimeTypeEnum.FOLDER:
          asset.type = AssetTypeEnum.FOLDER;
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
        case MimeTypeEnum.EOT_FONT:
          asset.type = AssetTypeEnum.EOT_FONT;
          break;
        case MimeTypeEnum.OTF_FONT:
          asset.type = AssetTypeEnum.OTF_FONT;
          break;
        case MimeTypeEnum.TTF_FONT:
          asset.type = AssetTypeEnum.TTF_FONT;
          break;
        case MimeTypeEnum.WOFF_FONT:
          asset.type = AssetTypeEnum.WOFF_FONT;
          break;
        case MimeTypeEnum.FOLDER && json.asset:
          asset.type = AssetTypeEnum.FOLDER;
          break;
        default:
          if (json.asset) {
            asset.type = AssetTypeEnum.ASSET;
          } else if (json.page) {
            asset.type = AssetTypeEnum.PAGE;
          } else if (json.folder) {
            asset.type = AssetTypeEnum.FOLDER;
          } else if (json.component) {
            asset.type = AssetTypeEnum.COMPONENT;
          } else if (json.document) {
            asset.type = AssetTypeEnum.DOCUMENT;
          } else if (json.levelDescriptor) {
            asset.type = AssetTypeEnum.LEVEL_DESCRIPTOR;
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

}

// if (json.new) {
//
// } else if (json.submitted) {
//
// } else if (json.scheduled) {
//
// } else if (json.published) {
//
// } else if (json.deleted) {
//
// } else if (json.inProgress) {
//
// } else if (json.live) {
//
// } else if (json.inFlight) {
//
// }

const MOCK = {
  'item': {

    'mimeType': 'application/xml',

    'uri': '/site/website/index.xml', // Unique ID within site
    'path': '/site/website',
    'name': 'index.xml',

    'internalName': 'Home',

    'contentType': '/page/entry',
    'form': '/page/entry',

    'browserUri': '',
    'site': 'launcher',

    'scheduledDate': null, // date which it will go live
    'submissionComment': null,

    'publishedDate': null, // last go live date

    'numOfChildren': 4,
    'children': [
      {
        'name': 'crafter-level-descriptor.level.xml',
        'internalName': '',
        'contentType': '/component/level-descriptor',
        'uri': '/site/website/crafter-level-descriptor.level.xml',
        'path': '/site/website',
        'browserUri': '/crafter-level-descriptor.level.xml',
        'navigation': false,
        'floating': true,
        'hideInAuthoring': false,
        'previewable': false,
        'lockOwner': '',
        'user': '',
        'userFirstName': '',
        'userLastName': '',
        'nodeRef': null,
        'metaDescription': null,
        'site': 'launcher',
        'page': true,
        'component': true,
        'document': false,
        'asset': false,
        'isContainer': false,
        'container': false,
        'disabled': false,
        'savedAsDraft': false,
        'submitted': false,
        'submittedForDeletion': false,
        'scheduled': false,
        'published': false,
        'deleted': false,
        'inProgress': false,
        'live': true,
        'inFlight': false,
        'isDisabled': false,
        'isSavedAsDraft': false,
        'isInProgress': false,
        'isLive': true,
        'isSubmittedForDeletion': false,
        'isScheduled': false,
        'isPublished': false,
        'isNavigation': false,
        'isDeleted': false,
        'isNew': false,
        'isSubmitted': false,
        'isFloating': false,
        'isPage': true,
        'isPreviewable': false,
        'isComponent': true,
        'isDocument': false,
        'isAsset': false,
        'isInFlight': false,
        'eventDate': null,
        'endpoint': null,
        'timezone': null,
        'numOfChildren': 0,
        'scheduledDate': null,
        'publishedDate': null,
        'mandatoryParent': null,
        'isLevelDescriptor': true,
        'categoryRoot': null,
        'lastEditDate': null,
        'form': '/component/level-descriptor',
        'formPagePath': 'simple',
        'renderingTemplates': [{ 'uri': '', 'name': 'DEFAULT' }],
        'folder': false,
        'submissionComment': null,
        'components': null,
        'documents': null,
        'levelDescriptors': null,
        'pages': null,
        'parentPath': null,
        'orders': [],
        'children': [],
        'size': 0.0,
        'sizeUnit': null,
        'mimeType': 'application/xml',
        'newFile': false,
        'new': false,
        'reference': false,
        'levelDescriptor': true
      },
      {
        'name': 'crafter-component.xml',
        'internalName': '',
        'contentType': '',
        'uri': '/site/website/crafter-component.xml',
        'path': '/site/website',
        'browserUri': '/crafter-component.xml',
        'navigation': false,
        'floating': true,
        'hideInAuthoring': true,
        'previewable': true,
        'lockOwner': '',
        'user': '',
        'userFirstName': '',
        'userLastName': '',
        'nodeRef': null,
        'metaDescription': null,
        'site': 'launcher',
        'page': true,
        'component': false,
        'document': false,
        'asset': false,
        'isContainer': false,
        'container': false,
        'disabled': false,
        'savedAsDraft': false,
        'submitted': false,
        'submittedForDeletion': false,
        'scheduled': false,
        'published': false,
        'deleted': false,
        'inProgress': false,
        'live': true,
        'inFlight': false,
        'isDisabled': false,
        'isSavedAsDraft': false,
        'isInProgress': false,
        'isLive': true,
        'isSubmittedForDeletion': false,
        'isScheduled': false,
        'isPublished': false,
        'isNavigation': false,
        'isDeleted': false,
        'isNew': false,
        'isSubmitted': false,
        'isFloating': false,
        'isPage': true,
        'isPreviewable': true,
        'isComponent': false,
        'isDocument': false,
        'isAsset': false,
        'isInFlight': false,
        'eventDate': null,
        'endpoint': null,
        'timezone': null,
        'numOfChildren': 0,
        'scheduledDate': null,
        'publishedDate': null,
        'mandatoryParent': null,
        'isLevelDescriptor': false,
        'categoryRoot': null,
        'lastEditDate': null,
        'form': null,
        'formPagePath': null,
        'renderingTemplates': [{ 'uri': '/templates/system/common/component.ftl', 'name': 'DEFAULT' }],
        'folder': false,
        'submissionComment': null,
        'components': null,
        'documents': null,
        'levelDescriptors': null,
        'pages': null,
        'parentPath': null,
        'orders': [],
        'children': [],
        'size': 0.0,
        'sizeUnit': null,
        'mimeType': 'application/xml',
        'newFile': false,
        'new': false,
        'reference': false,
        'levelDescriptor': false
      },
      {
        'name': 'index.xml',
        'internalName': 'Entertainment',
        'contentType': '/page/entertainment',
        'uri': '/site/website/movies/index.xml',
        'path': '/site/website/movies',
        'browserUri': '/movies',
        'navigation': false,
        'floating': true,
        'hideInAuthoring': false,
        'previewable': true,
        'lockOwner': '',
        'user': 'admin',
        'userFirstName': 'admin',
        'userLastName': '',
        'nodeRef': null,
        'metaDescription': null,
        'site': 'launcher',
        'page': true,
        'component': false,
        'document': false,
        'asset': false,
        'isContainer': true,
        'container': true,
        'disabled': false,
        'savedAsDraft': false,
        'submitted': false,
        'submittedForDeletion': false,
        'scheduled': false,
        'published': false,
        'deleted': false,
        'inProgress': true,
        'live': false,
        'inFlight': false,
        'isDisabled': false,
        'isSavedAsDraft': false,
        'isInProgress': true,
        'isLive': false,
        'isSubmittedForDeletion': false,
        'isScheduled': false,
        'isPublished': false,
        'isNavigation': false,
        'isDeleted': false,
        'isNew': true,
        'isSubmitted': false,
        'isFloating': false,
        'isPage': true,
        'isPreviewable': true,
        'isComponent': false,
        'isDocument': false,
        'isAsset': false,
        'isInFlight': false,
        'eventDate': '2017-10-31T12:54:33Z',
        'endpoint': null,
        'timezone': null,
        'numOfChildren': 0,
        'scheduledDate': null,
        'publishedDate': null,
        'mandatoryParent': null,
        'isLevelDescriptor': false,
        'categoryRoot': null,
        'lastEditDate': '2017-10-31T12:54:33Z',
        'form': '/page/entertainment',
        'formPagePath': 'simple',
        'renderingTemplates': [{ 'uri': '/templates/web/entertainment.ftl', 'name': 'DEFAULT' }],
        'folder': false,
        'submissionComment': null,
        'components': null,
        'documents': null,
        'levelDescriptors': null,
        'pages': null,
        'parentPath': null,
        'orders': [{ 'name': null, 'id': 'default', 'order': -1.0, 'disabled': null, 'placeInNav': null }],
        'children': [],
        'size': 0.0,
        'sizeUnit': null,
        'mimeType': 'application/xml',
        'newFile': false,
        'new': true,
        'reference': false,
        'levelDescriptor': false
      },
      {
        'name': 'index.xml',
        'internalName': 'Player',
        'contentType': '/page/player',
        'uri': '/site/website/player/index.xml',
        'path': '/site/website/player',
        'browserUri': '/player',
        'navigation': false,
        'floating': true,
        'hideInAuthoring': false,
        'previewable': true,
        'lockOwner': '',
        'user': 'admin',
        'userFirstName': 'admin',
        'userLastName': '',
        'nodeRef': null,
        'metaDescription': null,
        'site': 'launcher',
        'page': true,
        'component': false,
        'document': false,
        'asset': false,
        'isContainer': true,
        'container': true,
        'disabled': false,
        'savedAsDraft': false,
        'submitted': false,
        'submittedForDeletion': false,
        'scheduled': false,
        'published': false,
        'deleted': false,
        'inProgress': true,
        'live': false,
        'inFlight': false,
        'isDisabled': false,
        'isSavedAsDraft': false,
        'isInProgress': true,
        'isLive': false,
        'isSubmittedForDeletion': false,
        'isScheduled': false,
        'isPublished': false,
        'isNavigation': false,
        'isDeleted': false,
        'isNew': true,
        'isSubmitted': false,
        'isFloating': false,
        'isPage': true,
        'isPreviewable': true,
        'isComponent': false,
        'isDocument': false,
        'isAsset': false,
        'isInFlight': false,
        'eventDate': '2017-10-31T12:54:55Z',
        'endpoint': null,
        'timezone': null,
        'numOfChildren': 0,
        'scheduledDate': null,
        'publishedDate': null,
        'mandatoryParent': null,
        'isLevelDescriptor': false,
        'categoryRoot': null,
        'lastEditDate': '2017-10-31T12:54:55Z',
        'form': '/page/player',
        'formPagePath': 'simple',
        'renderingTemplates': [{ 'uri': '/templates/web/player.ftl', 'name': 'DEFAULT' }],
        'folder': false,
        'submissionComment': null,
        'components': null,
        'documents': null,
        'levelDescriptors': null,
        'pages': null,
        'parentPath': null,
        'orders': [{ 'name': null, 'id': 'default', 'order': -1.0, 'disabled': null, 'placeInNav': null }],
        'children': [],
        'size': 0.0,
        'sizeUnit': null,
        'mimeType': 'application/xml',
        'newFile': false,
        'new': true,
        'reference': false,
        'levelDescriptor': false
      }
    ],

    // Last edit date, both
    'eventDate': null,
    'lastEditDate': null,

    // Lock owner User
    'lockOwner': '',

    // Last edit user
    'user': '',
    'userFirstName': '',
    'userLastName': '',

    // e.g. adaptive design, region templates, channels
    'renderingTemplates': [{ 'uri': '/templates/web/entry.ftl', 'name': 'DEFAULT' }],

    // ... relationships
    'pages': null,
    'documents': null,
    'components': null,
    'parentPath': null,
    'levelDescriptors': null,

    // physical size
    'size': 0.0,
    'sizeUnit': null,

    // Disabled/Not disabled (logically deleted)
    'disabled': false,
    'isDisabled': false,

    // Drafted (draft not yet publish)
    'savedAsDraft': false,
    'isSavedAsDraft': false,

    // Navigation
    'navigation': false,
    'isNavigation': false,
    'floating': true,
    'isFloating': false, // Floating means is not shown in the "nav bar"
    'orders': [
      {
        'name': null,
        'id': 'default',
        'order': -1.0,
        'disabled': null,
        'placeInNav': null
      }
    ],

    //
    // TYPE of Asset
    //

    'folder': false,

    'page': true,
    'isPage': true,

    'component': false,
    'isComponent': false,

    'document': false,
    'isDocument': false,

    'asset': false,
    'isAsset': false,

    'container': true,
    'isContainer': true,

    'levelDescriptor': false,
    'isLevelDescriptor': false,

    //
    // Workflow States...
    //
    'new': false,
    'isNew': false,
    'newFile': false,

    'submitted': false,
    'isSubmitted': false,

    'submittedForDeletion': false,
    'isSubmittedForDeletion': false,

    'scheduled': false,
    'isScheduled': false,

    'published': false,
    'isPublished': false,

    'deleted': false,
    'isDeleted': false,

    'inProgress': false,
    'isInProgress': false,

    'live': true,
    'isLive': true,

    'inFlight': false,
    'isInFlight': false,

    // - - - \\
    // Do not show in authoring (not needed since items with this set to true would not show in studio at all)
    'hideInAuthoring': false,
    // - - - \\
    // Can be calculated with asset type and probably shouldn't really be decided by the asset itself
    'previewable': true,
    'isPreviewable': true,
    // - - - \\
    // Historical, delete, dead
    'formPagePath': 'simple',
    'nodeRef': null,
    'timezone': null,
    'mandatoryParent': null,
    'categoryRoot': null,
    // - - - \\
    // No clue
    'metaDescription': null,
    'reference': false,
    'endpoint': null
  }
};
