import { Asset } from '../models/asset.model';
import { User } from '../models/user.model';
import { Site } from '../models/site.model';
import { Group } from '../models/group.model';

export type StudioModelType =
  typeof Asset |
  typeof User |
  typeof Site |
  typeof Group;

export type StudioModel =
  Asset |
  User |
  Site |
  Group;
