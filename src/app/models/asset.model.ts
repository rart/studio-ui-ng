import { User, UserProps } from './user.model';
import { WorkflowStatusEnum } from '../enums/workflow-status.enum';
import { AssetTypeEnum } from '../enums/asset-type.enum';
import { MimeTypeEnum } from '../enums/mime-type.enum';
import { notNullOrUndefined } from '../app.utils';
import { isNullOrUndefined } from 'util';

interface RenderingTemplate {
  name: 'DEFAULT' | 'MOBILE';
  internalURI: string;
}

// const reverseMimeMap = {};
// Object.keys(MimeTypeEnum).forEach(type => reverseMimeMap[MimeTypeEnum[type]] = type);

export class Asset {

  id: string;
  path: string;
  fileName: string;
  url: string;
  label: string;
  contentModelId: string;
  projectCode: string;
  children: Asset[];
  childrenIds: string[];
  numOfChildren: number;
  lockedBy: User;
  lastEditedBy: User;
  lastEditedOn: string;
  publishedOn: string;
  type: AssetTypeEnum;
  mimeType: MimeTypeEnum;
  workflowStatus: WorkflowStatusEnum;
  renderingTemplates: RenderingTemplate[];

  get locked(): boolean {
    return this.workflowStatus.endsWith('_LOCKED');
  }

  get hasChildren(): boolean {
    return (this.numOfChildren > 0);
  }

  static deserialize(json: any) {
    if (isNullOrUndefined(json)) {
      return null;
    }

    let model = new Asset();

    model.id = json.id;
    model.path = json.path;
    model.fileName = json.fileName;
    model.url = json.url;
    model.label = json.label;
    model.contentModelId = json.contentModelId;
    model.projectCode = json.projectCode;
    model.children = null;
    model.childrenIds = null;
    if (notNullOrUndefined(json.children)) {
      model.children = [];
      model.childrenIds = [];
      json.children.forEach((a, i) => {
        model.children[i] = (a instanceof Asset) ? a : Asset.deserialize(a);
        model.childrenIds[i] = model.children[i].id;
      });
    }
    model.numOfChildren = json.numOfChildren;
    model.lockedBy = (json.lockedBy instanceof User)
      ? json.lockedBy
      : User.deserialize(json.lockedBy);
    model.lastEditedBy = (json.lastEditedBy instanceof User)
      ? json.lastEditedBy
      : User.deserialize(json.lastEditedBy);
    model.lastEditedOn = json.lastEditedOn;
    model.publishedOn = json.publishedOn;
    model.type = json.type;
    model.mimeType = json.mimeType;
    model.workflowStatus = json.workflowStatus;
    model.renderingTemplates = json.renderingTemplates;

    return model;

  }

}
