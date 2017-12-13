import { StringUtils } from '../utils/string.utils';
import { v4 as uuid } from 'uuid';
import { Asset } from '../models/asset.model';
import { AssetTypeEnum } from '../enums/asset-type.enum';

interface HistoryItem {
  url: string;
  title: string;
  projectCode: string;
  asset: Asset;
  edit: boolean;
}

export interface PreviewTabProps {
  id: string;
  url: string;
  title: string;
  asset: Asset;
  projectCode: string;
  edit: boolean;
  isNew: boolean;
  active: boolean;
}

/**
 * @deprecated
 */
export class PreviewTab implements PreviewTabProps {

  readonly id: string;

  url: string;
  title: string;
  asset: Asset = null;
  projectCode: string = null;
  edit = false;

  isNew = false;
  active = false;

  private history: Array<HistoryItem> = [];
  private historyIndex = -1;
  private pending = true; // The guest hasn't checked in

  /**
   * @param url {string}
   * @param title {string}
   * @param projectCode {string} The identifying code of the project this tab refers to
   * @param isNew {boolean} The tab has a 'blank' URL pending user input
   **/
  constructor(id = uuid()) {
    this.id = id;
  }

  static deserialize(json) {
    let tab = new PreviewTab();
    let { url, title, projectCode, asset, edit = false, isNew = false, active = false } = json;
    tab.isNew = isNew;
    tab.active = active;
    tab.navigate(projectCode, url, title, asset, edit);
    return tab;
  }

  /**
   * Updates the current history entry to reflect the
   * instance's current state/values
   * */
  private updateHistory() {
    let { url, title, projectCode, asset, edit } = this;
    if (this.history.length === 0) {
      this.track({ url, title, projectCode, asset, edit });
    } else {
      this.history[this.historyIndex].url = url;
      this.history[this.historyIndex].edit = edit;
      this.history[this.historyIndex].title = title;
      this.history[this.historyIndex].asset = asset;
      this.history[this.historyIndex].projectCode = projectCode;
    }
  }

  private setValues(url: string,
                    title: string,
                    projectCode: string,
                    asset: Asset,
                    edit: boolean) {
    this.url = url;
    this.title = title;
    this.asset = asset;
    this.projectCode = projectCode;
    this.edit = edit;
  }

  back() {
    let history = this.history;
    if (this.hasBack()) {
      let { url, title, projectCode, asset, edit } = history[--this.historyIndex];
      this.setValues(url, title, projectCode, asset, edit);
      this.pending = true;
      return true;
    } else {
      return false;
    }
  }

  hasBack() {
    return this.historyIndex > 0;
  }

  forward() {
    let history = this.history;
    if (this.hasForward()) {
      let { url, title, projectCode, asset, edit } = history[++this.historyIndex];
      this.setValues(url, title, projectCode, asset, edit);
      this.pending = true;
      return true;
    } else {
      return false;
    }
  }

  hasForward() {
    return (this.history.length > 1) && (this.historyIndex < (this.history.length - 1));
  }

  navigate(projectCode: string,
           url: string,
           title = '...',
           asset: Asset = this.asset,
           edit = this.edit) {
    this.track({ url, title, projectCode, asset, edit });
    this.setValues(url, title, projectCode, asset, edit);
  }

  update(url: string,
         title: string,
         projectCode: string = this.projectCode,
         asset: Asset = this.asset,
         edit = this.edit) {

    this.setValues(url, title, projectCode, asset, edit);
    this.updateHistory();

    this.pending = false;

  }

  editing(isEditing: boolean) {
    this.navigate(this.projectCode, this.url, this.title, this.asset, isEditing);
  }

  notifyExternalLoad(url = this.url, title = 'External Page') {
    this.update(url, title, null);
  }

  track(newEntry: HistoryItem) {
    let
      history = this.history,
      currentEntry = history[this.historyIndex];
    if ((!currentEntry) ||
      (currentEntry.projectCode !== newEntry.projectCode) ||
      (currentEntry.url !== newEntry.url) ||
      (currentEntry.edit !== newEntry.edit)) {
      let
        index = this.historyIndex,
        lastIndex = history.length - 1;
      if (index < lastIndex) {
        // Cut the history here
        history.splice(index + 1);
      }
      this.historyIndex++;
      this.history.push(newEntry);
      // Entry tracked
      return true;
    }
    // Duplicate entry, ignored. History preserved.
    return false;
  }

  isPending() {
    return this.pending;
  }

  // NOT a Crafter preview/engine page.
  // Studio won't be able to interact with the page unless set up for it.
  isExternal(url = this.url) {
    return (StringUtils.startsWith(url, 'http') || StringUtils.startsWith(url, '//'));
  }

  type() {
    let type = 'page';
    let { asset } = this;
    if (asset) {
      switch (asset.type) {
        case AssetTypeEnum.CSS:
        case AssetTypeEnum.HTML:
        case AssetTypeEnum.SCSS:
        case AssetTypeEnum.SASS:
        case AssetTypeEnum.LESS:
        case AssetTypeEnum.GROOVY:
        case AssetTypeEnum.JAVASCRIPT:
        case AssetTypeEnum.FREEMARKER:
          type = 'text';
          break;
        case AssetTypeEnum.MP4:
          type = 'video';
          break;
        case AssetTypeEnum.MPEG:
          type = 'audio';
          break;
        case AssetTypeEnum.TTF_FONT:
        case AssetTypeEnum.OTF_FONT:
        case AssetTypeEnum.EOT_FONT:
        case AssetTypeEnum.WOFF_FONT:
        case AssetTypeEnum.WOFF2_FONT:
          type = 'font';
          break;
        case AssetTypeEnum.GIF:
        case AssetTypeEnum.PNG:
        case AssetTypeEnum.SVG:
        case AssetTypeEnum.JPEG:
          type = 'image';
          break;
        default:
          type = 'page';
      }
    } else {
      type = 'page';
    }
    return type;
  }

}
