import { Asset } from '../models/asset.model';
import { User } from '../models/user.model';
import { Project } from '../models/project.model';
import { Group } from '../models/group.model';

export type StudioModelType =
  typeof Asset |
  typeof Project;

export type StudioModel =
  Asset |
  User |
  Project |
  Group;

export type StudioModels = 'Asset' | 'User' | 'Project' | 'Project' | 'Group';
